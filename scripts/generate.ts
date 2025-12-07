import * as fs from 'node:fs/promises';

import { generate_secret_santa } from './generate-secret-santa.ts';

try {
	const paths = generate_secret_santa();
	await fs.writeFile('./src/secret-santa.json', JSON.stringify(paths, null, 2));
} catch (error) {
	console.error(
		'⚠️ Failed to generate secret santa combinations. Please try again.',
	);
	console.error(error);
}
