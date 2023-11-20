import { customAlphabet } from 'nanoid';

export function generate_secret_santa() {
	const result = shuffle(
		['Adam', 'Annika', 'Aron', 'Ewa', 'Magdalena', 'Per'],
		{
			Adam: 'Magdalena',
			Annika: 'Aron',
			Aron: 'Annika',
			Ewa: 'Per',
			Magdalena: 'Adam',
			Per: 'Ewa',
		},
		100,
	);

	const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 6);

	const paths = {} as Record<string, [string, string]>;
	for (const [key, value] of Object.entries(result)) {
		const id = nanoid();
		paths[id] = [key, value];
	}

	return paths;
}

type SecretSanta<
	People extends ReadonlyArray<string>,
	ForbiddenCombinations extends Record<People[number], People[number]>,
> = {
	[Key in People[number]]: Exclude<
		People[number],
		ForbiddenCombinations[Key] | Key
	>;
};

function shuffle<
	const People extends ReadonlyArray<string>,
	const ForbiddenCombinations extends Record<People[number], People[number]>,
>(
	people: People,
	forbidden_combinations: ForbiddenCombinations,
	max_tries: number,
	shuffles = 0,
): SecretSanta<People, ForbiddenCombinations> {
	try {
		let available_people = [...people];
		const secret_santa = {} as Partial<
			SecretSanta<People, ForbiddenCombinations>
		>;

		for (let person of people as ReadonlyArray<People[number]>) {
			const dissallowed = [person, forbidden_combinations[person]];
			let target = person;
			let tries = 0;

			while (dissallowed.includes(target)) {
				target = available_people[
					get_random_int(0, available_people.length)
				] as People[number];

				tries += 1;
				if (tries > max_tries) {
					throw new ShuffleError(person, secret_santa, shuffles);
				}
			}

			available_people.splice(available_people.indexOf(target), 1);
			secret_santa[person] = target as any as undefined;
		}

		return secret_santa as SecretSanta<People, ForbiddenCombinations>;
	} catch (error) {
		if (shuffles > max_tries) throw error;
		return shuffle(people, forbidden_combinations, max_tries, shuffles + 1);
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
	state: Record<string, unknown>;
	shuffles: number;

	constructor(
		failedPerson: string,
		state: Record<string, unknown>,
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
