// for each T as [typeA, typeB]
// return typeB if typeA is not never
export type ConditionalUnion<T extends [any, any][]> = Exclude<
	{
		[K in keyof T]: T[K][0] extends never ? never : T[K][1];
	}[number],
	never
>;
