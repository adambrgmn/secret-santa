import { customAlphabet } from 'nanoid';

export function generate_secret_santa() {
	const result = shuffle(
		[
			['Adam', 'Magdalena'],
			['Aron', 'Annika'],
			['Per', 'Ewa'],
		],
		[
			['Adam', 'Aron'],
			['Aron', 'Adam'],
			['Magdalena', 'Per'],
			['Per', 'Magdalena'],
			['Annika', 'Ewa'],
			['Ewa', 'Annika'],
		],
		100,
	);

	const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 6);

	const paths = {} as Record<string, [string, string]>;
	for (const [giver, receiver] of result) {
		const id = nanoid();
		paths[id] = [giver, receiver];
	}

	return paths;
}

/**
 *
 * @param couples The couples participating in the secret santa
 * @param previous_version Previous years shuffle, to avoid repetition
 * @param max_tries Maximum tries to avoid infinite loop
 * @param shuffles Ignore, internal
 */
function shuffle<
	const Person extends string,
	const Couples extends [Person, Person][],
>(
	couples: Couples,
	previous_version: NoInfer<[giver: Person, receiver: Person][]>,
	max_tries: number,
	shuffles = 0,
) {
	let available_people = couples.flatMap((couple) => couple);
	const secret_santa = [] as [giver: Person, receiver: Person][];

	try {
		for (let giver of couples.flatMap((couple) => couple)) {
			const dissallowed = new Set([
				...couples.find(([x, y]) => x === giver || y === giver)!, // no giving between couples and to self
				...previous_version.find(([x]) => x === giver)!, // no exchange like last year
				secret_santa.find(([, receiver]) => receiver === giver)?.[0], // no giving to the one giving you
			]);

			let receiver = giver;
			let tries = 0;

			while (dissallowed.has(receiver)) {
				receiver = available_people.at(
					get_random_int(0, available_people.length),
				)!;

				tries += 1;
				if (tries > max_tries) {
					throw new ShuffleError(giver, secret_santa, shuffles);
				}
			}

			available_people.splice(available_people.indexOf(receiver), 1);
			secret_santa.push([giver, receiver]);
		}

		return secret_santa;
	} catch (error) {
		if (shuffles > max_tries) throw error;
		return shuffle(couples, previous_version, max_tries, shuffles + 1);
	}
}

/**
 * Get a random intiger between min and exclusive max
 */
function get_random_int(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min)) + min;
}

class ShuffleError extends Error {
	failed_person: string;
	state: [giver: string, receiver: string][];
	shuffles: number;

	constructor(
		failedPerson: string,
		state: [giver: string, receiver: string][],
		shuffles: number,
	) {
		super(`Failed to find a match for ${failedPerson} after ${shuffles} tries`);
		this.failed_person = failedPerson;
		this.state = state;
		this.shuffles = shuffles;
	}

	data() {
		return {
			message: this.message,
			failed_person: this.failed_person,
			state: this.state,
			shuffles: this.shuffles,
		};
	}

	toJSON() {
		return this.data();
	}
}
