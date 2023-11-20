import '@total-typescript/ts-reset';

import secret_santa from './secret-santa.json';

interface Env {}

export default {
	async fetch(
		request: Request,
		_: Env,
		__: ExecutionContext,
	): Promise<Response> {
		const { pathname } = new URL(request.url);

		const [id = ''] = pathname.split('/').slice(1);

		const decision = secret_santa[id as keyof typeof secret_santa] as
			| [string, string]
			| undefined;

		if (decision != null) {
			const [giver, receiver] = decision;
			return doc(html`
				<div class="result">
					<p class="pre">🎅🏼</p>
					<h1>${giver} 👉 ${receiver}</h1>
					<p class="post">Men säg inget!</p>
				</div>
			`);
		}

		switch (pathname) {
			case '/secret-santa':
				return doc(html`<pre>${JSON.stringify(secret_santa, null, 2)}</pre>`);
			default:
				return doc(html`<h1>Bra försök. Men inte idag... 🎅🏼</h1>`, {
					status: 404,
				});
		}
	},
};

function doc(main: string, init: ResponseInit = {}) {
	const document = html`
		<!doctype html>
		<html lang="sv">
			<head>
				<meta charset="utf-8" />
				<title>Secret Santa</title>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
				<link
					href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap"
					rel="stylesheet"
				/>
				<link
					rel="stylesheet"
					href="https://unpkg.com/modern-css-reset/dist/reset.min.css"
				/>

				<style>
					:root {
						--color-text: rgb(21 22 21);
						--color-text-inverted: rgb(255 255 255);
						--color-bg-primary: rgb(250 233 165);
						--color-bg-secondary: rgb(47 68 196);
					}

					body {
						font-family: 'Playfair Display', serif;
						color: var(--color-text);
						background-color: var(--color-bg-primary);
					}

					h1 {
						font-weight: 400;
					}

					main {
						display: flex;
						flex-flow: column nowrap;
						align-items: center;
						justify-content: center;
						min-height: 75dvh;
						width: 100%;
						max-width: 62rem;
						margin-inline: auto;
					}

					.result {
						display: flex;
						flex-flow: column nowrap;
						gap: 2rem;

						& .pre,
						& .post {
							text-align: center;
							font-size: 3rem;
						}

						& h1 {
							color: var(--color-text-inverted);
							background-color: var(--color-bg-secondary);
							border-radius: 2rem;
							padding-inline: 4rem;
							padding-block: 1rem;
							font-size: 5rem;
							text-align: center;
						}
					}

					.not-found {
						font-size: 3rem;
						text-wrap: balance;
					}
				</style>
			</head>
			<body>
				<main>${main}</main>
			</body>
		</html>
	`;

	return new Response(document, {
		...init,
		headers: {
			...init.headers,
			'Content-Type': 'text/html; charset=utf-8',
			'Content-Length': document.length.toString(),
			'Cache-Control': 'no-cache',
		},
	});
}

function html(template: TemplateStringsArray, ...substitutions: string[]) {
	let result = '';
	for (let i = 0; i < template.length; i++) {
		result += template[i];
		if (i < substitutions.length) {
			result += substitutions[i];
		}
	}

	return result.trim();
}

function hash(key: string) {
	return [...key].reduce(
		(hash, char) => (hash * 31 + char.charCodeAt(0)) | 0,
		0,
	);
}
