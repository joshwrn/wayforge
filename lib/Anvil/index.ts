import type { Refinement } from "fp-ts/lib/Refinement"

/* eslint-disable prettier/prettier */
export const become =
  <T>
  (nextVersionOfThing: Modifier<T> | T) =>
  (originalThing: T): T =>
    nextVersionOfThing instanceof Function
      ? nextVersionOfThing(originalThing)
      : nextVersionOfThing
/* eslint-enable prettier/prettier */

export type Applicator<X, Y> = (next: Modifier<X> | X) => Modifier<Y>
export type Modifier<T> = (thing: T) => T
export type Validator<T> = (input: unknown) => input is T

export type OneOrMany<T> = T | T[]

export const isModifier =
  <T>(validate: Validator<T>) =>
  (sample: T): Validator<Modifier<T>> => {
    const sampleIsValid = validate(sample)
    if (!sampleIsValid) {
      throw new Error(`Invalid test case: JSON.stringify(${sample})`)
    }
    return (input: unknown): input is Modifier<T> => {
      if (typeof input !== `function`) return false
      const testResult = input(sample)
      return validate(testResult)
    }
  }

export const typeOf =
  <T>(input: unknown) =>
  (isType: Refinement<unknown, T>): boolean =>
    isType(input)

export const raiseError = (message: string): never => {
  throw new Error(message)
}
