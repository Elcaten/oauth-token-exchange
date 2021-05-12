import {AzureFunction, Context, HttpRequest} from "@azure/functions"
import fetch from "node-fetch";

interface TokenResponseSuccess {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}
interface TokenResponseError {
    error: string
}
type TokenResponse = TokenResponseSuccess | TokenResponseError

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const CLIENT_ID = process.env["CLIENT_ID"]
    const CLIENT_SECRET = process.env["CLIENT_SECRET"]
    const TOKEN_URL = process.env["TOKEN_URL"]

    if (
        CLIENT_ID == null ||
        CLIENT_SECRET == null ||
        TOKEN_URL == null
    ) {
        context.res = {
            status: 500,
        }
        context.log.error('Environment variables are missing')
        return;
    }

    const refreshToken = (req.query.refreshToken || (req.body && req.body.refreshToken));

    if (refreshToken == null) {
        context.res = {
            status: 400,
            body: 'refreshToken code is misssing'
        }
        return;
    }

    const tokenResponse = await fetch(TOKEN_URL, {
        method: 'post',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
        }),
    }).then(r => r.json() as Promise<TokenResponse>)

    context.res = {
        body: tokenResponse
    };

};

export default httpTrigger;