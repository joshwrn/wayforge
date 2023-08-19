import { registerSelector } from "./register-selector"
import type { ReadonlySelector } from "./selector-internal"
import { selector__INTERNAL } from "./selector-internal"
import type {
	FamilyMetadata,
	ReadonlySelectorOptions,
	ReadonlySelectorToken,
} from "../.."
import { cacheValue } from "../caching"
import type { Store, StoreCore } from "../store"
import { Subject } from "../subject"

export const createReadonlySelector = <T>(
	options: ReadonlySelectorOptions<T>,
	family: FamilyMetadata | undefined,
	store: Store,
	core: StoreCore,
): ReadonlySelectorToken<T> => {
	const subject = new Subject<{ newValue: T; oldValue: T }>()

	const { get } = registerSelector(options.key, store)
	const getSelf = () => {
		const value = options.get({ get })
		cacheValue(options.key, value, store)
		return value
	}

	const readonlySelector: ReadonlySelector<T> = {
		...options,
		subject,
		install: (s: Store) => selector__INTERNAL(options, family, s),
		get: getSelf,
		type: `readonly_selector`,
		...(family && { family }),
	}
	core.readonlySelectors.set(options.key, readonlySelector)
	const initialValue = getSelf()
	store.config.logger?.info(`   ✨ "${options.key}" =`, initialValue)
	const token: ReadonlySelectorToken<T> = {
		key: options.key,
		type: `readonly_selector`,
	}
	if (family) {
		token.family = family
	}
	store.subject.selectorCreation.next(token)
	return token
}
