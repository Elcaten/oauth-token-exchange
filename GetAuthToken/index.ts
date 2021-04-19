import {AzureFunction, Context, HttpRequest} from "@azure/functions"
import fetch from "node-fetch";

interface TokenResponseSuccess {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}
interface TokekResponseError {
    error: string
}
type TokenResponse = TokenResponseSuccess | TokekResponseError

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const CLIENT_ID = process.env["CLIENT_ID"]
    const CLIENT_SECRET = process.env["CLIENT_SECRET"]
    const REDIRECT_URL = process.env["REDIRECT_URL"]
    const TOKEN_URL = process.env["TOKEN_URL"]

    if (
        CLIENT_ID == null ||
        CLIENT_SECRET == null ||
        REDIRECT_URL == null ||
        TOKEN_URL == null
    ) {
        context.res = {
            status: 500,
        }
        context.log.error('Environment variables are missing')
        return;
    }

    const code = (req.query.code || (req.body && req.body.code));

    if (code == null) {
        context.res = {
            status: 400,
            body: 'auth code is misssing'
        }
        return;
    }

    context.log(new URLSearchParams({
        'grant_type': 'authorization_code',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code,
        'redirect_uri': REDIRECT_URL
    }).toString())

    const token = await fetch(TOKEN_URL, {
        method: 'post',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'code': code,
            'redirect_uri': REDIRECT_URL
        }),
    }).then(r => r.json() as Promise<TokenResponse>)

    context.res = {
        body: {
            token: token
        }
    };

};

export default httpTrigger;