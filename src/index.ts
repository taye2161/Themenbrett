/* istanbul ignore file */
import dotenv from "dotenv";
dotenv.config() // read ".env"

import http from "http";
import https from "https";
import fs from "fs";
import mongoose from 'mongoose';
import { app } from "./app";
import { logger } from "./logger";
import { prefillDB } from "./prefill";


async function setup() {

    let mongodURI = process.env.DB_CONNECTION_STRING;
    if (!mongodURI) {
        logger.error(`Cannot start, no database configured. Set environment variable DB_CONNECTION_STRING. Use "memory" for MongoMemoryServer`);
        process.exit(1);
    }
    if (mongodURI === "memory") {
        logger.info("Start MongoMemoryServer")
        const MMS = await import('mongodb-memory-server')
        const mongo = await MMS.MongoMemoryServer.create();
        mongodURI = mongo.getUri();
    }

    logger.info(`Connect to mongod at ${mongodURI}`)
    await mongoose.connect(mongodURI);

    if (process.env.DB_PREFILL === "true") {
        await prefillDB();
    }

    const useSSL = process.env.USE_SSL === "true";
    const keyPath = process.env.SSL_KEY_FILE || "cert/private.key";
    const crtPath = process.env.SSL_CRT_FILE || "cert/public.crt";

    const defaultPort = useSSL ? 3001 : 3000;
    const port = process.env.HTTPS_PORT ? parseInt(process.env.HTTPS_PORT) : defaultPort;

    let server: http.Server | https.Server;

    if(useSSL){
        try {
            const options = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(crtPath)
            };
            server = https.createServer(options, app);
            logger.info("🔒 Starting server in HTTPS mode");
        } catch (error: any) {
            logger.error(`Failed to load SSL certificates: ${error.message}. Falling back to HTTP.`);
            server = http.createServer(app);
        }
    } else {
        server = http.createServer(app);
        logger.info("🔓 Starting server in HTTP mode");
    }

    server.listen(port, () => {
        const protocol = useSSL ? "https" : "http";
        logger.info(`Listening for ${protocol.toUpperCase()} at ${protocol}://localhost:${port}`);
    });
};

setup();