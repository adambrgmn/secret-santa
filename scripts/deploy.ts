import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';

import { generate_secret_santa } from './generate-secret-santa.ts';

try {
	const paths = generate_secret_santa();
	await fs.writeFile('./src/secret-santa.json', JSON.stringify(paths, null, 2));
	console.error(`🎅 Generated secret santa mystery!`);

	execSync(`npx wrangler deploy`, { stdio: 'inherit' });
	console.error(`🎅 New version deployed!`);

	await fs.writeFile(
		'./src/secret-santa.json',
		JSON.stringify(generate_secret_santa(), null, 2),
	);
	console.error(
		`🎅 Re-generated secret santa mystery so no sneaking can happen!`,
	);

	console.log('\n----------------------------------------------\n');
	for (let [path, [giver]] of Object.entries(paths)) {
		console.log(
			`🎅 ${giver}: https://secret-santa.fransvilhelm.workers.dev/${path}`,
		);
	}
} catch (error) {
	console.error(
		'⚠️ Failed to generate secret santa combinations. Please try again.',
	);
	console.error(error);
}
