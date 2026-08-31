// donenv wird über setupFiles.ts (vgl. jest.config.js) geladen
import { readFile } from "fs/promises";
import https from "https";
import supertest from "supertest";
import { app } from "../src/app";
import { createProf } from "../src/services/ProfService";
import { createGebiet } from "../src/services/GebietService";
import { GebietResource } from "../src/Resources";

beforeEach(async () => {

    const moriarty = await createProf({
        name: "Moriarty", campusID: "T381047", titel: "Prof. Dr.", password: "12345bcdABCD..;,.", admin: false
    });
    for (let i = 1; i < 10; i++) {
        await createGebiet({
            name: "Gebiet" + i,
            public: true, closed: false,
            verwalter: moriarty.id!
        })
    }
})


test("https test", async () => {

    expect(process.env.HTTPS_PORT).toBeDefined();
    expect(process.env.SSL_KEY_FILE).toBeDefined();
    expect(process.env.SSL_CRT_FILE).toBeDefined(); // Achten Sie vor allem hier auf die richtige Schreibweise!

    const httpsPort = parseInt(process.env.HTTPS_PORT!);
    expect(httpsPort).not.toBeNaN();
    const keyFile = process.env.SSL_KEY_FILE;
    const certFile = process.env.SSL_CRT_FILE;


    // https://nodejs.org/api/cli.html#node_tls_reject_unauthorizedvalue
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    // set up server:
    const [privateSSLKey, publicSSLCert] = await Promise.all(
        [readFile(keyFile!), readFile(certFile!)]
    );
    const httpsServer = https.createServer(
        { key: privateSSLKey, cert: publicSSLCert },
        app);

    try {
        await new Promise<void>((resolve, reject) => {
            const listenOn = (port: number) => {
                const onError = (err: NodeJS.ErrnoException) => {
                    httpsServer.off("listening", onListening);
                    if (err.code === "EADDRINUSE" && port === httpsPort) {
                        listenOn(0); // fallback to random free port
                        return;
                    }
                    reject(err);
                };
                const onListening = () => {
                    httpsServer.off("error", onError);
                    resolve();
                };

                httpsServer.once("error", onError);
                httpsServer.once("listening", onListening);
                httpsServer.listen(port);
            };

            listenOn(httpsPort);
        });
        // get that nice board
        const testee = supertest(httpsServer);
        const response = await testee.get(`/api/gebiet/alle`);
        expect(response.statusCode).toBe(200); // Seite kann geladen werden
        const gebietResources: GebietResource[] = response.body;
        expect(gebietResources.length).toBe(9); // alle 9 Gebiete gefunden
    } finally {
        await new Promise<void>((resolve) => httpsServer.close(() => resolve())); // in jedem Fall Server beenden
    }
});