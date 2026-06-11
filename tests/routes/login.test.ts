import { parseCookies } from "restmatcher";
import supertest from "supertest";
import { app } from "../../src/app";
import { createProf } from "../../src/services/ProfService";

test(`/api/login POST, Positivtest`, async () => {
    // arrange:
    await createProf({name: "Admin", campusID: "admin", password: "xyzXYZ123!§xxx", admin: true })
    
    // act:
    const testee = supertest(app);
    const loginData = { campusID: "admin", password: "xyzXYZ123!§xxx" };
    const response = parseCookies(await testee.post(`/api/login`).send(loginData));
    
    // assert:
    expect(response).statusCode("2*")
    // added by parseCookies, similar to express middleware cookieParser
    expect(response).toHaveProperty("cookies"); // added by parseCookies
    expect(response.cookies).toHaveProperty("access_token"); // the cookie with the JWT
    const token = response.cookies.access_token;
    expect(token).toBeDefined();
 });

 test('/api/login POST, Negativtest (Falsches Passwort)', async () => {
    await createProf({ name: "Test Prof", campusID: "prof01", password: "richtigesPasswort", admin: false });
    
    const testee = supertest(app);
    const falscheLoginData = { campusID: "prof01", password: "falschesPasswort!" };
    const response = await testee.post(`/api/login`).send(falscheLoginData);
    
    expect(response).statusCode("401");
});

test('/api/login POST, Validierungsfehler', async () => {
    const testee = supertest(app);
    const response = await testee.post(`/api/login`).send({});
    
    expect(response).statusCode("400");
    expect(response.body).toHaveProperty("errors"); 
});

test(`/api/login GET, Positivtest (Eingeloggt)`, async () => {
    await createProf({ name: "User Prof", campusID: "prof02", password: "secretpassword", admin: false });
    
    const testee = supertest(app);
    const loginResponse = await testee.post(`/api/login`).send({ campusID: "prof02", password: "secretpassword" });
    
    const cookieHeader = loginResponse.headers['set-cookie'];

    const response = await testee.get(`/api/login`).set('Cookie', cookieHeader);

    expect(response).statusCode("200");
    expect(response.body).toHaveProperty("id");
    expect(response.body.role).toBe("u");
    expect(response.body).toHaveProperty("exp");
});

test(`/api/login GET, Negativtest (Nicht eingeloggt)`, async () => {
    const testee = supertest(app);
    const response = await testee.get(`/api/login`);

    expect(response).statusCode("401");
    expect(response.body).toBe(false);
});

test(`/api/login DELETE, Erfolgreicher Logout`, async () => {
    const testee = supertest(app);
    
    const response = parseCookies(await testee.delete(`/api/login`));

    expect(response).statusCode("204"); 
});