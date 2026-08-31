import type { ThemaResource, GebietResource, LoginResource, ProfResource } from "../Resources.ts";
import { fetchWithErrorHandling } from "./fetchWithErrorHandling";
import { themen, gebiete } from "./testdata";

const BASE_URL = import.meta.env.VITE_API_SERVER_URL;

export async function getAlleGebiete(): Promise<GebietResource[]> {
    if (import.meta.env.VITE_REAL_FETCH !== 'true') {
        await new Promise(r => setTimeout(r, 700)); // emulate some loading time
        return Promise.resolve(gebiete);
    } else {
        //await new Promise(r => setTimeout(r, 700));
        const response = await fetchWithErrorHandling(`${BASE_URL}/api/gebiet/alle`,
            {
                credentials: "include"
            }
        );
        return response.json() as Promise<GebietResource[]>;
    }
}

export async function getAlleThemen(gebietId: string): Promise<ThemaResource[]> {
    if (import.meta.env.VITE_REAL_FETCH !== 'true') {
        await new Promise(r => setTimeout(r, 700));
        return Promise.resolve(themen.filter(t => t.gebiet === gebietId));
    } else {
        //await new Promise(r => setTimeout(r, 700));
        const response = await fetchWithErrorHandling(`${BASE_URL}/api/gebiet/${gebietId}/themen`,
            {
                credentials: "include"
            }
        );
        return response.json() as Promise<ThemaResource[]>;
    }
}

export async function getGebiet(gebietId: string): Promise<GebietResource> {
    if (import.meta.env.VITE_REAL_FETCH !== 'true') {
        await new Promise(r => setTimeout(r, 700));
        const gebiet = gebiete.find(g => g.id === gebietId);
        if (!gebiet) {
            throw new Error(`Gebiet with id ${gebietId} not found in test data`);
        }
        return Promise.resolve(gebiet);
    } else {
        //await new Promise(r => setTimeout(r, 700));
        const response = await fetchWithErrorHandling(`${BASE_URL}/api/gebiet/${gebietId}`,
            {
                credentials: "include"
            }
        );
        return response.json();
    }
}

export async function getThema(themaId: string): Promise<ThemaResource> {
    if (import.meta.env.VITE_REAL_FETCH !== 'true') {
        await new Promise(r => setTimeout(r, 700));
        const thema = themen.find(t => t.id === themaId);
        if (!thema) {
            throw new Error(`Thema with id ${themaId} not found in test data`);
        }
        return Promise.resolve(thema);
    } else {
        //await new Promise(r => setTimeout(r, 700));
        const response = await fetchWithErrorHandling(`${BASE_URL}/api/thema/${themaId}`,
            {
                credentials: "include"
            }
        );
        return response.json() as Promise<ThemaResource>;
    }
}

export async function login(campusID: string, password: string): Promise<LoginResource> {
    const response = await fetchWithErrorHandling(`${BASE_URL}/api/login`, 
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            campusID,
            password,
        }),
    });
    return response.json() as Promise<LoginResource>;
}

export async function getLogin(): Promise<LoginResource | false> {
    const response = await fetchWithErrorHandling(`${BASE_URL}/api/login`, {
        method: "GET",
        credentials: "include",
    });

    if (response.status === 401) {
        return false;
    }

    if (!response.ok) {
        throw new Error("Fehler beim Abrufen des Loginstatus");
    }

    return response.json() as Promise<LoginResource>;
}

export async function logout(): Promise<void> {
    await fetchWithErrorHandling(`${BASE_URL}/api/login`, {
        method: "DELETE",
        credentials: "include",
    });
}

export async function getAlleProfs(): Promise<ProfResource[]> {
    const response = await fetchWithErrorHandling(`${BASE_URL}/api/prof/alle`,
        {
            credentials: "include",
        }
    );
    return response.json() as Promise<ProfResource[]>;
}

export async function createProf(
    prof: {
        name: string;
        campusID: string;
        admin: boolean;
        password: string;
    }
): Promise<ProfResource> {
    const response = await fetchWithErrorHandling(
        `${BASE_URL}/api/prof`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(prof)
        }
    );

    return response.json();
}

export async function updateProf(
    id: string,
    prof: {
        name: string;
        campusID: string;
        admin: boolean;
        password?: string;
    }
): Promise<ProfResource> {
    const response = await fetchWithErrorHandling(
        `${BASE_URL}/api/prof/${id}`,
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(prof)
        }
    );

    return response.json();
}

export async function deleteProf(id: string): Promise<void> {
    await fetchWithErrorHandling(
        `${BASE_URL}/api/prof/${id}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );
}

export async function createGebiet(gebiet: GebietResource): Promise<GebietResource> {
    const response = await fetchWithErrorHandling(
        `${BASE_URL}/api/gebiet`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(gebiet),
        }
    );

    return response.json();
}

export async function updateGebiet(id: string, gebiet: GebietResource): Promise<GebietResource> {
    const response = await fetchWithErrorHandling(
        `${BASE_URL}/api/gebiet/${id}`,
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(gebiet),
        }
    );

    return response.json() as Promise<GebietResource>;
}

export async function deleteGebiet(id: string): Promise<void> {
    await fetchWithErrorHandling(
        `${BASE_URL}/api/gebiet/${id}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );
}

export async function createThema(gebietId: string, thema: ThemaResource): Promise<ThemaResource> {
    const response = await fetchWithErrorHandling(
        `${BASE_URL}/api/thema`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...thema,
                gebiet: gebietId,
            }),
        }
    );

    return response.json();
}

export async function updateThema(id: string, thema: ThemaResource): Promise<ThemaResource> {
    const response = await fetchWithErrorHandling(
        `${BASE_URL}/api/thema/${id}`,
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(thema),
        }
    );

    return response.json();
}

export async function deleteThema(id: string): Promise<void> {
    await fetchWithErrorHandling(
        `${BASE_URL}/api/thema/${id}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );
}

export async function changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
): Promise<ProfResource> {
    const response = await fetchWithErrorHandling(
        `${BASE_URL}/api/prof/${id}/password`,
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id,
                oldPassword,
                newPassword
            })
        }
    );

    return response.json();
}
