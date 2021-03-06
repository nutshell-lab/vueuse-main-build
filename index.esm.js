import { isRef, ref, watchEffect, computed, customRef, unref, createApp, reactive, watch, getCurrentInstance, onMounted, onUpdated, toRefs as toRefs$1, shallowRef, markRaw, readonly, isVue2 } from 'vue-demi';
import { isClient, isString, noop, tryOnUnmounted, promiseTimeout, increaseWithUnit, useTimeoutFn, watchWithFilter, tryOnMounted, createFilterWrapper, bypassFilter, createSingletonPromise, containsProp, createEventHook, throttleFilter, timestamp, isFunction, isObject, ignorableWatch, isNumber, useIntervalFn, pausableFilter, identity, clamp, pausableWatch } from '@vueuse/shared';
export * from '@vueuse/shared';

/**
 * Create an asynchronous computed dependency.
 *
 * @see https://vueuse.org/asyncComputed
 * @param evaluationCallback     The promise-returning callback which generates the computed value
 * @param initialState           The initial state, used until the first evaluation finishes
 * @param optionsOrRef           Additional options or a ref passed to receive the updates of the async evaluation
 */
function asyncComputed(evaluationCallback, initialState, optionsOrRef) {
    let options;
    if (isRef(optionsOrRef)) {
        options = {
            evaluating: optionsOrRef,
        };
    }
    else {
        options = optionsOrRef || {};
    }
    const { lazy = false, evaluating = undefined, } = options;
    const started = ref(!lazy);
    const current = ref(initialState);
    let counter = 0;
    watchEffect(async (onInvalidate) => {
        if (!started.value)
            return;
        counter++;
        const counterAtBeginning = counter;
        let hasFinished = false;
        try {
            // Defer initial setting of `evaluating` ref
            // to avoid having it as a dependency
            if (evaluating) {
                Promise.resolve().then(() => {
                    evaluating.value = true;
                });
            }
            const result = await evaluationCallback((cancelCallback) => {
                onInvalidate(() => {
                    if (evaluating)
                        evaluating.value = false;
                    if (!hasFinished)
                        cancelCallback();
                });
            });
            if (counterAtBeginning === counter)
                current.value = result;
        }
        finally {
            if (evaluating)
                evaluating.value = false;
            hasFinished = true;
        }
    });
    if (lazy) {
        return computed(() => {
            started.value = true;
            return current.value;
        });
    }
    else {
        return current;
    }
}

/**
 * Create a ref which will be reset to the default value after some time.
 *
 * @see https://vueuse.org/autoResetRef
 * @param defaultValue The value which will be set.
 * @param afterMs      A zero-or-greater delay in milliseconds.
 */
function autoResetRef(defaultValue, afterMs = 10000) {
    return customRef((track, trigger) => {
        let value = defaultValue;
        let timer;
        const resetAfter = () => setTimeout(() => {
            value = defaultValue;
            trigger();
        }, unref(afterMs));
        return {
            get() {
                track();
                return value;
            },
            set(newValue) {
                value = newValue;
                trigger();
                clearTimeout(timer);
                timer = resetAfter();
            },
        };
    });
}

const defaultWindow =  isClient ? window : undefined;
const defaultDocument =  isClient ? window.document : undefined;
const defaultNavigator =  isClient ? window.navigator : undefined;

function withScope(factory) {
    let state = null;
    const document = defaultDocument;
    if (document) {
        const container = document.createElement('div');
        createApp({
            setup() {
                state = reactive(factory());
            },
            render: () => null,
        }).mount(container);
    }
    else {
        state = reactive(factory());
    }
    return state;
}
/**
 * Keep states in the global scope to be reusable across Vue instances.
 *
 * @see https://vueuse.org/createGlobalState
 * @param stateFactory A factory function to create the state
 */
function createGlobalState(stateFactory) {
    let state;
    return () => {
        if (state == null)
            state = withScope(stateFactory);
        return state;
    };
}

/**
 * Get the dom element of a ref of element or Vue component instance
 *
 * @param elRef
 */
function unrefElement(elRef) {
    var _a, _b;
    const plain = unref(elRef);
    return (_b = (_a = plain) === null || _a === void 0 ? void 0 : _a.$el) !== null && _b !== void 0 ? _b : plain;
}

function useEventListener(...args) {
    let target;
    let event;
    let listener;
    let options;
    if (isString(args[0])) {
        [event, listener, options] = args;
        target = defaultWindow;
    }
    else {
        [target, event, listener, options] = args;
    }
    if (!target)
        return noop;
    let cleanup = noop;
    const stopWatch = watch(() => unref(target), (el) => {
        cleanup();
        if (!el)
            return;
        el.addEventListener(event, listener, options);
        cleanup = () => {
            el.removeEventListener(event, listener, options);
            cleanup = noop;
        };
    }, { immediate: true, flush: 'post' });
    const stop = () => {
        stopWatch();
        cleanup();
    };
    tryOnUnmounted(stop);
    return stop;
}

/**
 * Listen for clicks outside of an element.
 *
 * @see https://vueuse.org/onClickOutside
 * @param target
 * @param handler
 * @param options
 */
function onClickOutside(target, handler, options = {}) {
    const { window = defaultWindow, event = 'pointerdown' } = options;
    if (!window)
        return;
    const listener = (event) => {
        const el = unrefElement(target);
        if (!el)
            return;
        if (el === event.target || event.composedPath().includes(el))
            return;
        handler(event);
    };
    return useEventListener(window, event, listener, { passive: true });
}

const createKeyPredicate = (keyFilter) => typeof keyFilter === 'function'
    ? keyFilter
    : typeof keyFilter === 'string'
        ? (event) => event.key === keyFilter
        : keyFilter
            ? () => true
            : () => false;
/**
 * Listen for keyboard keys being stroked.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
function onKeyStroke(key, handler, options = {}) {
    const { target = defaultWindow, eventName = 'keydown', passive = false } = options;
    const predicate = createKeyPredicate(key);
    const listener = (e) => {
        if (predicate(e))
            handler(e);
    };
    return useEventListener(target, eventName, listener, passive);
}
/**
 * Listen to the keydown event of the given key.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
function onKeyDown(key, handler, options = {}) {
    return onKeyStroke(key, handler, Object.assign(Object.assign({}, options), { eventName: 'keydown' }));
}
/**
 * Listen to the keypress event of the given key.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
function onKeyPressed(key, handler, options = {}) {
    return onKeyStroke(key, handler, Object.assign(Object.assign({}, options), { eventName: 'keypress' }));
}
/**
 * Listen to the keyup event of the given key.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
function onKeyUp(key, handler, options = {}) {
    return onKeyStroke(key, handler, Object.assign(Object.assign({}, options), { eventName: 'keyup' }));
}

/* this implementation is original ported from https://github.com/streamich/react-use by Vadim Dalecky */
const isFocusedElementEditable = () => {
    const { activeElement, body } = document;
    if (!activeElement)
        return false;
    // If not element has focus, we assume it is not editable, too.
    if (activeElement === body)
        return false;
    // Assume <input> and <textarea> elements are editable.
    switch (activeElement.tagName) {
        case 'INPUT':
        case 'TEXTAREA':
            return true;
    }
    // Check if any other focused element id editable.
    return activeElement.hasAttribute('contenteditable');
};
const isTypedCharValid = ({ keyCode, metaKey, ctrlKey, altKey, }) => {
    if (metaKey || ctrlKey || altKey)
        return false;
    // 0...9
    if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))
        return true;
    // a...z
    if (keyCode >= 65 && keyCode <= 90)
        return true;
    // All other keys.
    return false;
};
/**
 * Fires when users start typing on non-editable elements.
 *
 * @see https://vueuse.org/onStartTyping
 * @param callback
 * @param options
 */
function onStartTyping(callback, options = {}) {
    const { document = defaultDocument } = options;
    const keydown = (event) => {
        !isFocusedElementEditable()
            && isTypedCharValid(event)
            && callback(event);
    };
    if (document)
        useEventListener(document, 'keydown', keydown, { passive: true });
}

/**
 * Shorthand for binding ref to template element.
 *
 * @see https://vueuse.org/templateRef
 * @param key
 * @param initialValue
 */
function templateRef(key, initialValue = null) {
    const instance = getCurrentInstance();
    let _trigger = () => { };
    const element = customRef((track, trigger) => {
        _trigger = trigger;
        return {
            get() {
                var _a, _b;
                track();
                return (_b = (_a = instance === null || instance === void 0 ? void 0 : instance.proxy) === null || _a === void 0 ? void 0 : _a.$refs[key]) !== null && _b !== void 0 ? _b : initialValue;
            },
            set() { },
        };
    });
    onMounted(_trigger);
    onUpdated(_trigger);
    return element;
}

/**
 * Extended `toRefs` that also accepts refs of an object.
 *
 * @see https://vueuse.org/toRefs
 * @param objectRef A ref or normal object or array.
 */
function toRefs(objectRef) {
    if (!isRef(objectRef))
        return toRefs$1(objectRef);
    const ret = Array.isArray(objectRef.value)
        ? new Array(objectRef.value.length)
        : {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key in objectRef.value) {
        ret[key] = computed({
            get() {
                return objectRef.value[key];
            },
            set(v) {
                objectRef.value[key] = v;
            },
        });
    }
    return ret;
}

/**
 * Reactive `document.activeElement`
 *
 * @see https://vueuse.org/useActiveElement
 * @param options
 */
function useActiveElement(options = {}) {
    const { window = defaultWindow } = options;
    const counter = ref(0);
    if (window) {
        useEventListener(window, 'blur', () => counter.value += 1, true);
        useEventListener(window, 'focus', () => counter.value += 1, true);
    }
    return computed(() => {
        // eslint-disable-next-line no-unused-expressions
        counter.value;
        return window === null || window === void 0 ? void 0 : window.document.activeElement;
    });
}

/**
 * Reactive async state. Will not block your setup function and will triggers changes once
 * the promise is ready.
 *
 * @see https://vueuse.org/useAsyncState
 * @param promise         The promise / async function to be resolved
 * @param initialState    The initial state, used until the first evaluation finishes
 * @param options
 */
function useAsyncState(promise, initialState, options = {}) {
    const { immediate = true, delay = 0, onError = noop, resetOnExecute = true, } = options;
    const state = shallowRef(initialState);
    const isReady = ref(false);
    const error = ref(undefined);
    async function execute(delay = 0) {
        if (resetOnExecute)
            state.value = initialState;
        error.value = undefined;
        isReady.value = false;
        if (delay > 0)
            await promiseTimeout(delay);
        const _promise = typeof promise === 'function'
            ? promise()
            : promise;
        try {
            const data = await _promise;
            // @ts-ignore
            state.value = data;
            isReady.value = true;
        }
        catch (e) {
            error.value = e;
            onError(e);
        }
    }
    if (immediate)
        execute(delay);
    return {
        state,
        isReady,
        error,
        execute,
    };
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
/**
 * Reactive Battery Status API.
 *
 * @see https://vueuse.org/useBattery
 * @param options
 */
function useBattery({ navigator = defaultNavigator } = {}) {
    const events = ['chargingchange', 'chargingtimechange', 'dischargingtimechange', 'levelchange'];
    const isSupported = navigator && 'getBattery' in navigator;
    const charging = ref(false);
    const chargingTime = ref(0);
    const dischargingTime = ref(0);
    const level = ref(1);
    let battery;
    function updateBatteryInfo() {
        charging.value = this.charging;
        chargingTime.value = this.chargingTime || 0;
        dischargingTime.value = this.dischargingTime || 0;
        level.value = this.level;
    }
    if (isSupported) {
        navigator
            .getBattery()
            .then((_battery) => {
            battery = _battery;
            updateBatteryInfo.call(battery);
            for (const event of events)
                useEventListener(battery, event, updateBatteryInfo, { passive: true });
        });
    }
    return {
        isSupported,
        charging,
        chargingTime,
        dischargingTime,
        level,
    };
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
/**
 * Reactive Media Query.
 *
 * @see https://vueuse.org/useMediaQuery
 * @param query
 * @param options
 */
function useMediaQuery(query, options = {}) {
    const { window = defaultWindow } = options;
    if (!window)
        return ref(false);
    const mediaQuery = window.matchMedia(query);
    const matches = ref(mediaQuery.matches);
    const handler = (event) => {
        matches.value = event.matches;
    };
    if ('addEventListener' in mediaQuery)
        mediaQuery.addEventListener('change', handler);
    else
        mediaQuery.addListener(handler);
    tryOnUnmounted(() => {
        if ('removeEventListener' in mediaQuery)
            mediaQuery.removeEventListener('change', handler);
        else
            mediaQuery.removeListener(handler);
    });
    return matches;
}

/**
 * Breakpoints from Tailwind V2
 *
 * @see https://tailwindcss.com/docs/breakpoints
 */
const breakpointsTailwind = {
    'sm': 640,
    'md': 768,
    'lg': 1024,
    'xl': 1280,
    '2xl': 1536,
};
/**
 * Breakpoints from Bootstrap V5
 *
 * @see https://getbootstrap.com/docs/5.0/layout/breakpoints
 */
const breakpointsBootstrapV5 = {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
};
/**
 * Breakpoints from Vuetify V2
 *
 * @see https://vuetifyjs.com/en/features/breakpoints
 */
const breakpointsVuetify = {
    xs: 600,
    sm: 960,
    md: 1264,
    lg: 1904,
};
/**
 * Breakpoints from Ant Design
 *
 * @see https://ant.design/components/layout/#breakpoint-width
 */
const breakpointsAntDesign = {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
};
/**
 * Sematic Breakpoints
 */
const breakpointsSematic = {
    mobileS: 320,
    mobileM: 375,
    mobileL: 425,
    tablet: 768,
    laptop: 1024,
    laptopL: 1440,
    desktop4K: 2560,
};

/**
 * Reactively viewport breakpoints
 *
 * @see https://vueuse.org/useBreakpoints
 * @param options
 */
function useBreakpoints(breakpoints, options = {}) {
    function getValue(k, delta) {
        let v = breakpoints[k];
        if (delta != null)
            v = increaseWithUnit(v, delta);
        if (typeof v === 'number')
            v = `${v}px`;
        return v;
    }
    const { window = defaultWindow } = options;
    function match(query) {
        if (!window)
            return false;
        return window.matchMedia(query).matches;
    }
    return {
        greater(k) {
            return useMediaQuery(`(min-width: ${getValue(k)})`, options);
        },
        smaller(k) {
            return useMediaQuery(`(max-width: ${getValue(k, -0.1)})`, options);
        },
        between(a, b) {
            return useMediaQuery(`(min-width: ${getValue(a)}) and (max-width: ${getValue(b, -0.1)})`, options);
        },
        isGreater(k) {
            return match(`(min-width: ${getValue(k)})`);
        },
        isSmaller(k) {
            return match(`(max-width: ${getValue(k, -0.1)})`);
        },
        isInBetween(a, b) {
            return match(`(min-width: ${getValue(a)}) and (max-width: ${getValue(b, -0.1)})`);
        },
    };
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
/**
 * Reactive browser location.
 *
 * @see https://vueuse.org/useBrowserLocation
 * @param options
 */
function useBrowserLocation({ window = defaultWindow } = {}) {
    const buildState = (trigger) => {
        const { state, length } = (window === null || window === void 0 ? void 0 : window.history) || {};
        const { hash, host, hostname, href, origin, pathname, port, protocol, search } = (window === null || window === void 0 ? void 0 : window.location) || {};
        return {
            trigger,
            state,
            length,
            hash,
            host,
            hostname,
            href,
            origin,
            pathname,
            port,
            protocol,
            search,
        };
    };
    const state = ref(buildState('load'));
    if (window) {
        useEventListener(window, 'popstate', () => state.value = buildState('popstate'), { passive: true });
        useEventListener(window, 'hashchange', () => state.value = buildState('hashchange'), { passive: true });
    }
    return state;
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
function useClipboard(options = {}) {
    const { navigator = defaultNavigator, read = true, source, copiedDuring = 1500, } = options;
    const events = ['copy', 'cut'];
    const isSupported = Boolean(navigator && 'clipboard' in navigator);
    const text = ref('');
    const copied = ref(false);
    const timeout = useTimeoutFn(() => copied.value = false, copiedDuring);
    function updateText() {
        // @ts-expect-error untyped API
        navigator.clipboard.readText().then((value) => {
            text.value = value;
        });
    }
    if (isSupported && read) {
        for (const event of events)
            useEventListener(event, updateText);
    }
    async function copy(value = unref(source)) {
        if (isSupported && value != null) {
            // @ts-expect-error untyped API
            await navigator.clipboard.writeText(value);
            text.value = value;
            copied.value = true;
            timeout.start();
        }
    }
    return {
        isSupported,
        text: text,
        copied: copied,
        copy,
    };
}

/**
 * Manipulate CSS variables.
 *
 * @see https://vueuse.org/useCssVar
 * @param prop
 * @param el
 * @param options
 */
function useCssVar(prop, target, { window = defaultWindow } = {}) {
    const variable = ref('');
    const elRef = computed(() => { var _a; return unrefElement(target) || ((_a = window === null || window === void 0 ? void 0 : window.document) === null || _a === void 0 ? void 0 : _a.documentElement); });
    watch(elRef, (el) => {
        if (el && window)
            variable.value = window.getComputedStyle(el).getPropertyValue(prop);
    }, { immediate: true });
    watch(variable, (val) => {
        var _a;
        if ((_a = elRef.value) === null || _a === void 0 ? void 0 : _a.style)
            elRef.value.style.setProperty(prop, val);
    });
    return variable;
}

const Serializers = {
    boolean: {
        read: (v) => v != null ? v === 'true' : null,
        write: (v) => String(v),
    },
    object: {
        read: (v) => v ? JSON.parse(v) : null,
        write: (v) => JSON.stringify(v),
    },
    number: {
        read: (v) => v != null ? Number.parseFloat(v) : null,
        write: (v) => String(v),
    },
    any: {
        read: (v) => v != null ? v : null,
        write: (v) => String(v),
    },
    string: {
        read: (v) => v != null ? v : null,
        write: (v) => String(v),
    },
};
/**
 * Reactive LocalStorage/SessionStorage.
 *
 * @see https://vueuse.org/useStorage
 * @param key
 * @param defaultValue
 * @param storage
 * @param options
 */
function useStorage(key, defaultValue, storage = defaultWindow === null || defaultWindow === void 0 ? void 0 : defaultWindow.localStorage, options = {}) {
    var _a;
    const { flush = 'pre', deep = true, listenToStorageChanges = true, window = defaultWindow, eventFilter, } = options;
    const data = ref(defaultValue);
    const type = defaultValue == null
        ? 'any'
        : typeof defaultValue === 'boolean'
            ? 'boolean'
            : typeof defaultValue === 'string'
                ? 'string'
                : typeof defaultValue === 'object'
                    ? 'object'
                    : Array.isArray(defaultValue)
                        ? 'object'
                        : !Number.isNaN(defaultValue)
                            ? 'number'
                            : 'any';
    const serializer = (_a = options.serializer) !== null && _a !== void 0 ? _a : Serializers[type];
    function read(event) {
        if (!storage)
            return;
        if (event && event.key !== key)
            return;
        try {
            const rawValue = event ? event.newValue : storage.getItem(key);
            if (rawValue == null) {
                data.value = defaultValue;
                storage.setItem(key, serializer.write(defaultValue));
            }
            else {
                data.value = serializer.read(rawValue);
            }
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);
        }
    }
    read();
    if (window && listenToStorageChanges)
        useEventListener(window, 'storage', read);
    watchWithFilter(data, () => {
        if (!storage) // SSR
            return;
        try {
            if (data.value == null)
                storage.removeItem(key);
            else
                storage.setItem(key, serializer.write(data.value));
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);
        }
    }, {
        flush,
        deep,
        eventFilter,
    });
    return data;
}

/**
 * Reactive dark theme preference.
 *
 * @see https://vueuse.org/usePreferredDark
 * @param [options]
 */
function usePreferredDark(options) {
    return useMediaQuery('(prefers-color-scheme: dark)', options);
}

/**
 * Reactive dark mode with auto data persistence.
 *
 * @see https://vueuse.org/useDark
 * @param options
 */
function useDark(options = {}) {
    const { selector = 'html', attribute = 'class', valueDark = 'dark', valueLight = '', window = defaultWindow, storage = defaultWindow === null || defaultWindow === void 0 ? void 0 : defaultWindow.localStorage, storageKey = 'vueuse-color-scheme', listenToStorageChanges = true, } = options;
    const preferredDark = usePreferredDark({ window });
    const store = storageKey == null
        ? ref('auto')
        : useStorage(storageKey, 'auto', storage, { window, listenToStorageChanges });
    const isDark = computed({
        get() {
            return store.value === 'auto'
                ? preferredDark.value
                : store.value === 'dark';
        },
        set(v) {
            if (v === preferredDark.value)
                store.value = 'auto';
            else
                store.value = v ? 'dark' : 'light';
        },
    });
    const onChanged = options.onChanged || ((v) => {
        const el = window === null || window === void 0 ? void 0 : window.document.querySelector(selector);
        if (attribute === 'class') {
            el === null || el === void 0 ? void 0 : el.classList.toggle(valueDark, v);
            if (valueLight)
                el === null || el === void 0 ? void 0 : el.classList.toggle(valueLight, !v);
        }
        else {
            el === null || el === void 0 ? void 0 : el.setAttribute(attribute, v ? valueDark : valueLight);
        }
    });
    watch(isDark, onChanged, { flush: 'post' });
    tryOnMounted(() => onChanged(isDark.value));
    return isDark;
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
/**
 * Reactive DeviceMotionEvent.
 *
 * @see https://vueuse.org/useDeviceMotion
 * @param options
 */
function useDeviceMotion(options = {}) {
    const { window = defaultWindow, eventFilter = bypassFilter, } = options;
    const acceleration = ref({ x: null, y: null, z: null });
    const rotationRate = ref({ alpha: null, beta: null, gamma: null });
    const interval = ref(0);
    const accelerationIncludingGravity = ref({
        x: null,
        y: null,
        z: null,
    });
    if (window) {
        const onDeviceMotion = createFilterWrapper(eventFilter, (event) => {
            acceleration.value = event.acceleration;
            accelerationIncludingGravity.value = event.accelerationIncludingGravity;
            rotationRate.value = event.rotationRate;
            interval.value = event.interval;
        });
        useEventListener(window, 'devicemotion', onDeviceMotion);
    }
    return {
        acceleration,
        accelerationIncludingGravity,
        rotationRate,
        interval,
    };
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
/**
 * Reactive DeviceOrientationEvent.
 *
 * @see https://vueuse.org/useDeviceOrientation
 * @param options
 */
function useDeviceOrientation(options = {}) {
    const { window = defaultWindow } = options;
    const isSupported = Boolean(window && 'DeviceOrientationEvent' in window);
    const isAbsolute = ref(false);
    const alpha = ref(null);
    const beta = ref(null);
    const gamma = ref(null);
    if (window && isSupported) {
        useEventListener(window, 'deviceorientation', (event) => {
            isAbsolute.value = event.absolute;
            alpha.value = event.alpha;
            beta.value = event.beta;
            gamma.value = event.gamma;
        });
    }
    return {
        isSupported,
        isAbsolute,
        alpha,
        beta,
        gamma,
    };
}

// device pixel ratio statistics from https://www.mydevice.io/
const DEVICE_PIXEL_RATIO_SCALES = [
    1,
    1.325,
    1.4,
    1.5,
    1.8,
    2,
    2.4,
    2.5,
    2.75,
    3,
    3.5,
    4,
];
/**
 * Reactively track `window.devicePixelRatio`.
 *
 * @see https://vueuse.org/useDevicePixelRatio
 * @param options
 */
function useDevicePixelRatio({ window = defaultWindow, } = {}) {
    if (!window) {
        return {
            pixelRatio: ref(1),
        };
    }
    const pixelRatio = ref(window.devicePixelRatio);
    const handleDevicePixelRatio = () => {
        pixelRatio.value = window.devicePixelRatio;
    };
    useEventListener(window, 'resize', handleDevicePixelRatio, { passive: true });
    DEVICE_PIXEL_RATIO_SCALES.forEach((dppx) => {
        // listen mql events in both sides
        const mqlMin = useMediaQuery(`screen and (min-resolution: ${dppx}dppx)`);
        const mqlMax = useMediaQuery(`screen and (max-resolution: ${dppx}dppx)`);
        watch([mqlMin, mqlMax], handleDevicePixelRatio);
    });
    return { pixelRatio };
}

function usePermission(permissionDesc, options = {}) {
    const { controls = false, navigator = defaultNavigator, } = options;
    const isSupported = Boolean(navigator && 'permissions' in navigator);
    let permissionStatus;
    const desc = typeof permissionDesc === 'string'
        ? { name: permissionDesc }
        : permissionDesc;
    const state = ref();
    const onChange = () => {
        if (permissionStatus)
            state.value = permissionStatus.state;
    };
    const query = createSingletonPromise(async () => {
        if (!isSupported)
            return;
        if (!permissionStatus) {
            try {
                permissionStatus = await navigator.permissions.query(desc);
                useEventListener(permissionStatus, 'change', onChange);
                onChange();
            }
            catch (_a) {
                state.value = 'prompt';
            }
        }
        return permissionStatus;
    });
    query();
    if (controls) {
        return {
            state: state,
            isSupported,
            query,
        };
    }
    else {
        return state;
    }
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
/**
 * Reactive `enumerateDevices` listing avaliable input/output devices
 *
 * @see https://vueuse.org/useDevicesList
 * @param options
 */
function useDevicesList(options = {}) {
    const { navigator = defaultNavigator, requestPermissions = false, onUpdated, } = options;
    const devices = ref([]);
    const videoInputs = computed(() => devices.value.filter(i => i.kind === 'videoinput'));
    const audioInputs = computed(() => devices.value.filter(i => i.kind === 'audioinput'));
    const audioOutputs = computed(() => devices.value.filter(i => i.kind === 'audiooutput'));
    let isSupported = false;
    const permissionGranted = ref(false);
    async function update() {
        if (!isSupported)
            return;
        devices.value = await navigator.mediaDevices.enumerateDevices();
        onUpdated === null || onUpdated === void 0 ? void 0 : onUpdated(devices.value);
    }
    async function ensurePermissions() {
        if (!isSupported)
            return false;
        if (permissionGranted.value)
            return true;
        const { state, query } = usePermission('camera', { controls: true });
        await query();
        if (state.value !== 'granted') {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            stream.getTracks().forEach(t => t.stop());
            update();
            permissionGranted.value = true;
        }
        else {
            permissionGranted.value = true;
        }
        return permissionGranted.value;
    }
    if (navigator) {
        isSupported = Boolean(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
        if (isSupported) {
            if (requestPermissions)
                ensurePermissions();
            useEventListener(navigator.mediaDevices, 'devicechange', update);
            update();
        }
    }
    return {
        devices,
        ensurePermissions,
        permissionGranted,
        videoInputs,
        audioInputs,
        audioOutputs,
        isSupported,
    };
}

/**
 * Reactively track `document.visibilityState`.
 *
 * @see https://vueuse.org/useDocumentVisibility
 * @param options
 */
function useDocumentVisibility({ document = defaultDocument } = {}) {
    if (!document)
        return ref('visible');
    const visibility = ref(document.visibilityState);
    useEventListener(document, 'visibilitychange', () => {
        visibility.value = document.visibilityState;
    });
    return visibility;
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

/**
 * Reports changes to the dimensions of an Element's content or the border-box
 *
 * @see https://vueuse.org/useResizeObserver
 * @param target
 * @param callback
 * @param options
 */
function useResizeObserver(target, callback, options = {}) {
    const { window = defaultWindow } = options, observerOptions = __rest(options, ["window"]);
    let observer;
    const isSupported = window && 'ResizeObserver' in window;
    const cleanup = () => {
        if (observer) {
            observer.disconnect();
            observer = undefined;
        }
    };
    const stopWatch = watch(() => unrefElement(target), (el) => {
        cleanup();
        if (isSupported && window && el) {
            // @ts-expect-error missing type
            observer = new window.ResizeObserver(callback);
            observer.observe(el, observerOptions);
        }
    }, { immediate: true, flush: 'post' });
    const stop = () => {
        cleanup();
        stopWatch();
    };
    tryOnUnmounted(stop);
    return {
        isSupported,
        stop,
    };
}

/**
 * Reactive size of an HTML element.
 *
 * @see https://vueuse.org/useElementSize
 * @param target
 * @param callback
 * @param options
 */
function useElementBounding(target, options = {}) {
    const height = ref(0);
    const bottom = ref(0);
    const left = ref(0);
    const right = ref(0);
    const top = ref(0);
    const width = ref(0);
    const x = ref(0);
    const y = ref(0);
    useResizeObserver(target, ([entry]) => {
        height.value = entry.contentRect.height;
        bottom.value = entry.contentRect.bottom;
        left.value = entry.contentRect.left;
        right.value = entry.contentRect.right;
        top.value = entry.contentRect.top;
        width.value = entry.contentRect.width;
        x.value = entry.contentRect.x;
        y.value = entry.contentRect.y;
    }, options);
    return {
        x,
        y,
        top,
        right,
        bottom,
        left,
        width,
        height,
    };
}

/**
 * Reactive size of an HTML element.
 *
 * @see https://vueuse.org/useElementSize
 * @param target
 * @param callback
 * @param options
 */
function useElementSize(target, initialSize = { width: 0, height: 0 }, options = {}) {
    const width = ref(initialSize.width);
    const height = ref(initialSize.height);
    useResizeObserver(target, ([entry]) => {
        width.value = entry.contentRect.width;
        height.value = entry.contentRect.height;
    }, options);
    return {
        width,
        height,
    };
}

/**
 * Tracks the visibility of an element within the viewport.
 *
 * @see https://vueuse.org/useElementVisibility
 * @param element
 * @param options
 */
function useElementVisibility(element, { window = defaultWindow, scrollTarget } = {}) {
    const elementIsVisible = ref(false);
    const testBounding = () => {
        if (!window)
            return;
        const document = window.document;
        if (!element.value) {
            elementIsVisible.value = false;
        }
        else {
            const rect = element.value.getBoundingClientRect();
            elementIsVisible.value = (rect.top <= (window.innerHeight || document.documentElement.clientHeight)
                && rect.left <= (window.innerWidth || document.documentElement.clientWidth)
                && rect.bottom >= 0
                && rect.right >= 0);
        }
    };
    tryOnMounted(testBounding);
    if (window)
        tryOnMounted(() => useEventListener((scrollTarget === null || scrollTarget === void 0 ? void 0 : scrollTarget.value) || window, 'scroll', testBounding, { capture: false, passive: true }));
    return elementIsVisible;
}

/**
 * Reactive wrapper for EventSource.
 *
 * @see https://vueuse.org/useEventSource
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventSource/EventSource EventSource
 * @param url
 * @param events
 */
function useEventSource(url, events = []) {
    const event = ref(null);
    const data = ref(null);
    const status = ref('CONNECTING');
    const eventSource = ref(null);
    const error = ref(null);
    const close = () => {
        if (eventSource.value) {
            eventSource.value.close();
            eventSource.value = null;
            status.value = 'CLOSED';
        }
    };
    tryOnMounted(() => {
        const es = new EventSource(url);
        eventSource.value = es;
        es.onopen = () => {
            status.value = 'OPEN';
            error.value = null;
        };
        es.onerror = (e) => {
            status.value = 'CLOSED';
            error.value = e;
        };
        es.onmessage = (e) => {
            event.value = null;
            data.value = e.data;
        };
        for (const event_name of events) {
            useEventListener(es, event_name, (e) => {
                event.value = event_name;
                data.value = e.data || null;
            });
        }
    });
    tryOnUnmounted(() => {
        close();
    });
    return {
        eventSource,
        event,
        data,
        status,
        error,
        close,
    };
}

/**
 * Reactive favicon.
 *
 * @see https://vueuse.org/useFavicon
 * @param newIcon
 * @param options
 */
function useFavicon(newIcon = null, options = {}) {
    const { baseUrl = '', rel = 'icon', document = defaultDocument, } = options;
    const favicon = isRef(newIcon)
        ? newIcon
        : ref(newIcon);
    const applyIcon = (icon) => {
        document === null || document === void 0 ? void 0 : document.head.querySelectorAll(`link[rel*="${rel}"]`).forEach(el => el.href = `${baseUrl}${icon}`);
    };
    watch(favicon, (i, o) => {
        if (isString(i) && i !== o)
            applyIcon(i);
    }, { immediate: true });
    return favicon;
}

const payloadMapping = {
    json: 'application/json',
    text: 'text/plain',
    formData: 'multipart/form-data',
};
/**
 * !!!IMPORTANT!!!
 *
 * If you update the UseFetchOptions interface, be sure to update this object
 * to include the new options
 */
function isFetchOptions(obj) {
    return containsProp(obj, 'immediate', 'refetch', 'beforeFetch', 'afterFetch');
}
function createFetch(config = {}) {
    let options = config.options || {};
    let fetchOptions = config.fetchOptions || {};
    function useFactoryFetch(url, ...args) {
        const computedUrl = computed(() => config.baseUrl
            ? joinPaths(unref(config.baseUrl), unref(url))
            : unref(url));
        // Merge properties into a single object
        if (args.length > 0) {
            if (isFetchOptions(args[0])) {
                options = Object.assign(Object.assign({}, options), args[0]);
            }
            else {
                fetchOptions = Object.assign(Object.assign(Object.assign({}, fetchOptions), args[0]), { headers: Object.assign(Object.assign({}, (fetchOptions.headers || {})), (args[0].headers || {})) });
            }
        }
        if (args.length > 1 && isFetchOptions(args[1]))
            options = Object.assign(Object.assign({}, options), args[1]);
        return useFetch(computedUrl, fetchOptions, options);
    }
    return useFactoryFetch;
}
function useFetch(url, ...args) {
    const supportsAbort = typeof AbortController === 'function';
    let fetchOptions = {};
    let options = { immediate: true, refetch: false };
    const config = {
        method: 'get',
        type: 'text',
        payload: undefined,
    };
    if (args.length > 0) {
        if (isFetchOptions(args[0]))
            options = Object.assign(Object.assign({}, options), args[0]);
        else
            fetchOptions = args[0];
    }
    if (args.length > 1) {
        if (isFetchOptions(args[1]))
            options = Object.assign(Object.assign({}, options), args[1]);
    }
    const { fetch = defaultWindow === null || defaultWindow === void 0 ? void 0 : defaultWindow.fetch, } = options;
    // Event Hooks
    const responseEvent = createEventHook();
    const errorEvent = createEventHook();
    const isFinished = ref(false);
    const isFetching = ref(false);
    const aborted = ref(false);
    const statusCode = ref(null);
    const response = shallowRef(null);
    const error = ref(null);
    const data = shallowRef(null);
    const canAbort = computed(() => supportsAbort && isFetching.value);
    let controller;
    const abort = () => {
        if (supportsAbort && controller)
            controller.abort();
    };
    const loading = (isLoading) => {
        isFetching.value = isLoading;
        isFinished.value = !isLoading;
    };
    const execute = async () => {
        var _a;
        loading(true);
        error.value = null;
        statusCode.value = null;
        aborted.value = false;
        controller = undefined;
        if (supportsAbort) {
            controller = new AbortController();
            controller.signal.onabort = () => aborted.value = true;
            fetchOptions = Object.assign(Object.assign({}, fetchOptions), { signal: controller.signal });
        }
        const defaultFetchOptions = {
            method: config.method,
            headers: {},
        };
        if (config.payload) {
            const headers = defaultFetchOptions.headers;
            if (config.payloadType)
                headers['Content-Type'] = (_a = payloadMapping[config.payloadType]) !== null && _a !== void 0 ? _a : config.payloadType;
            defaultFetchOptions.body = config.payloadType === 'json' ? JSON.stringify(config.payload) : config.payload;
        }
        let isCanceled = false;
        const context = { url: unref(url), options: fetchOptions, cancel: () => { isCanceled = true; } };
        if (options.beforeFetch)
            Object.assign(context, await options.beforeFetch(context));
        if (isCanceled || !fetch) {
            loading(false);
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            var _a;
            fetch(context.url, Object.assign(Object.assign(Object.assign({}, defaultFetchOptions), context.options), { headers: Object.assign(Object.assign({}, defaultFetchOptions.headers), (_a = context.options) === null || _a === void 0 ? void 0 : _a.headers) }))
                .then(async (fetchResponse) => {
                response.value = fetchResponse;
                statusCode.value = fetchResponse.status;
                let responseData = await fetchResponse[config.type]();
                if (options.afterFetch)
                    ({ data: responseData } = await options.afterFetch({ data: responseData, response: fetchResponse }));
                data.value = responseData;
                // see: https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
                if (!fetchResponse.ok)
                    throw new Error(fetchResponse.statusText);
                responseEvent.trigger(fetchResponse);
                resolve(fetchResponse);
            })
                .catch((fetchError) => {
                error.value = fetchError.message || fetchError.name;
                errorEvent.trigger(fetchError);
            })
                .finally(() => {
                loading(false);
            });
        });
    };
    watch(() => [
        unref(url),
        unref(options.refetch),
    ], () => unref(options.refetch) && execute(), { deep: true });
    const base = {
        isFinished,
        statusCode,
        response,
        error,
        data,
        isFetching,
        canAbort,
        aborted,
        abort,
        execute,
        onFetchResponse: responseEvent.on,
        onFetchError: errorEvent.on,
    };
    const typeConfigured = Object.assign(Object.assign({}, base), { get: setMethod('get'), put: setMethod('put'), post: setMethod('post'), delete: setMethod('delete') });
    const shell = Object.assign(Object.assign({}, typeConfigured), { json: setType('json'), text: setType('text'), blob: setType('blob'), arrayBuffer: setType('arrayBuffer'), formData: setType('formData') });
    function setMethod(method) {
        return (payload, payloadType) => {
            if (!isFetching.value) {
                config.method = method;
                config.payload = payload;
                config.payloadType = payloadType;
                // Set the payload to json type only if it's not provided and a literal object is provided
                // The only case we can deduce the content type and `fetch` can't
                if (!payloadType && payload && Object.getPrototypeOf(payload) === Object.prototype)
                    config.payloadType = 'json';
                return base;
            }
            return undefined;
        };
    }
    function setType(type) {
        return () => {
            if (!isFetching.value) {
                config.type = type;
                return typeConfigured;
            }
            return undefined;
        };
    }
    if (options.immediate)
        setTimeout(execute, 0);
    return shell;
}
function joinPaths(start, end) {
    if (!start.endsWith('/') && !end.startsWith('/'))
        return `${start}/${end}`;
    return `${start}${end}`;
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
// from: https://github.com/sindresorhus/screenfull.js/blob/master/src/screenfull.js
const functionsMap = [
    [
        'requestFullscreen',
        'exitFullscreen',
        'fullscreenElement',
        'fullscreenEnabled',
        'fullscreenchange',
        'fullscreenerror',
    ],
    // New WebKit
    [
        'webkitRequestFullscreen',
        'webkitExitFullscreen',
        'webkitFullscreenElement',
        'webkitFullscreenEnabled',
        'webkitfullscreenchange',
        'webkitfullscreenerror',
    ],
    // Old WebKit
    [
        'webkitRequestFullScreen',
        'webkitCancelFullScreen',
        'webkitCurrentFullScreenElement',
        'webkitCancelFullScreen',
        'webkitfullscreenchange',
        'webkitfullscreenerror',
    ],
    [
        'mozRequestFullScreen',
        'mozCancelFullScreen',
        'mozFullScreenElement',
        'mozFullScreenEnabled',
        'mozfullscreenchange',
        'mozfullscreenerror',
    ],
    [
        'msRequestFullscreen',
        'msExitFullscreen',
        'msFullscreenElement',
        'msFullscreenEnabled',
        'MSFullscreenChange',
        'MSFullscreenError',
    ],
];
/**
 * Reactive Fullscreen API.
 *
 * @see https://vueuse.org/useFullscreen
 * @param target
 * @param options
 */
function useFullscreen(target, options = {}) {
    const { document = defaultDocument } = options;
    const targetRef = ref(target || (document === null || document === void 0 ? void 0 : document.querySelector('html')));
    const isFullscreen = ref(false);
    let isSupported = false;
    let map = functionsMap[0];
    if (!document) {
        isSupported = false;
    }
    else {
        for (const m of functionsMap) {
            if (m[1] in document) {
                map = m;
                isSupported = true;
                break;
            }
        }
    }
    const [REQUEST, EXIT, ELEMENT, , EVENT] = map;
    async function exit() {
        if (!isSupported)
            return;
        if (document === null || document === void 0 ? void 0 : document[ELEMENT])
            await document[EXIT]();
        isFullscreen.value = false;
    }
    async function enter() {
        if (!isSupported)
            return;
        await exit();
        if (targetRef.value) {
            await targetRef.value[REQUEST]();
            isFullscreen.value = true;
        }
    }
    async function toggle() {
        if (isFullscreen.value)
            await exit();
        else
            await enter();
    }
    if (document) {
        useEventListener(document, EVENT, () => {
            isFullscreen.value = !!(document === null || document === void 0 ? void 0 : document[ELEMENT]);
        }, false);
    }
    return {
        isSupported,
        isFullscreen,
        enter,
        exit,
        toggle,
    };
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
/**
 * Reactive Geolocation API.
 *
 * @see https://vueuse.org/useGeolocation
 * @param options
 */
function useGeolocation(options = {}) {
    const { enableHighAccuracy = true, maximumAge = 30000, timeout = 27000, navigator = defaultNavigator, } = options;
    const isSupported = navigator && 'geolocation' in navigator;
    const locatedAt = ref(null);
    const error = ref(null);
    const coords = ref({
        accuracy: 0,
        latitude: 0,
        longitude: 0,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
    });
    function updatePosition(position) {
        locatedAt.value = position.timestamp;
        coords.value = position.coords;
        error.value = null;
    }
    let watcher;
    tryOnMounted(() => {
        if (isSupported) {
            watcher = navigator.geolocation.watchPosition(updatePosition, err => error.value = err, {
                enableHighAccuracy,
                maximumAge,
                timeout,
            });
        }
    });
    tryOnUnmounted(() => {
        if (watcher && navigator)
            navigator.geolocation.clearWatch(watcher);
    });
    return {
        isSupported,
        coords,
        locatedAt,
        error,
    };
}

const defaultEvents = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel'];
const oneMinute = 60000;
/**
 * Tracks whether the user is being inactive.
 *
 * @see https://vueuse.org/useIdle
 * @param timeout default to 1 minute
 * @param options IdleOptions
 */
function useIdle(timeout = oneMinute, options = {}) {
    const { initialState = false, listenForVisibilityChange = true, events = defaultEvents, window = defaultWindow, eventFilter = throttleFilter(50), } = options;
    const idle = ref(initialState);
    const lastActive = ref(timestamp());
    let timer;
    const onEvent = createFilterWrapper(eventFilter, () => {
        idle.value = false;
        lastActive.value = timestamp();
        clearTimeout(timer);
        timer = setTimeout(() => idle.value = true, timeout);
    });
    if (window) {
        const document = window.document;
        for (const event of events)
            useEventListener(window, event, onEvent, { passive: true });
        if (listenForVisibilityChange) {
            useEventListener(document, 'visibilitychange', () => {
                if (!document.hidden)
                    onEvent();
            });
        }
    }
    timer = setTimeout(() => idle.value = true, timeout);
    return { idle, lastActive };
}

/**
 * Detects that a target element's visibility.
 *
 * @see https://vueuse.org/useIntersectionObserver
 * @param target
 * @param callback
 * @param options
 */
function useIntersectionObserver(target, callback, options = {}) {
    const { root, rootMargin = '0px', threshold = 0.1, window = defaultWindow, } = options;
    const isSupported = window && 'IntersectionObserver' in window;
    let cleanup = noop;
    const stopWatch = isSupported
        ? watch(() => ({
            el: unrefElement(target),
            root: unrefElement(root),
        }), ({ el, root }) => {
            cleanup();
            if (!el)
                return;
            // @ts-expect-error missing type
            const observer = new window.IntersectionObserver(callback, {
                root,
                rootMargin,
                threshold,
            });
            observer.observe(el);
            cleanup = () => {
                observer.disconnect();
                cleanup = noop;
            };
        }, { immediate: true, flush: 'post' })
        : noop;
    const stop = () => {
        cleanup();
        stopWatch();
    };
    tryOnUnmounted(stop);
    return {
        isSupported,
        stop,
    };
}

/**
 * Reactive LocalStorage.
 *
 * @see https://vueuse.org/useLocalStorage
 * @param key
 * @param defaultValue
 * @param options
 */
function useLocalStorage(key, defaultValue, options = {}) {
    const { window = defaultWindow } = options;
    return useStorage(key, defaultValue, window === null || window === void 0 ? void 0 : window.localStorage, options);
}

const DefaultMagicKeysAliasMap = {
    ctrl: 'control',
    command: 'meta',
    cmd: 'meta',
    option: 'alt',
    up: 'arrowup',
    down: 'arrowdown',
    left: 'arrowleft',
    right: 'arrowright',
};

function useMagicKeys(options = {}) {
    const { reactive: useReactive = false, target = defaultWindow, aliasMap = DefaultMagicKeysAliasMap, passive = true, onEventFired = noop, } = options;
    const current = reactive(new Set());
    const obj = { toJSON() { return {}; }, current };
    const refs = useReactive ? reactive(obj) : obj;
    function updateRefs(e, value) {
        const key = e.key.toLowerCase();
        const code = e.code.toLowerCase();
        const values = [code, key];
        // current set
        if (value)
            current.add(e.code);
        else
            current.delete(e.code);
        for (const key of values) {
            if (key in refs) {
                if (useReactive)
                    refs[key] = value;
                else
                    refs[key].value = value;
            }
        }
    }
    if (target) {
        useEventListener(target, 'keydown', (e) => {
            updateRefs(e, true);
            return onEventFired(e);
        }, { passive });
        useEventListener(target, 'keyup', (e) => {
            updateRefs(e, false);
            return onEventFired(e);
        }, { passive });
    }
    const proxy = new Proxy(refs, {
        get(target, prop, rec) {
            if (typeof prop !== 'string')
                return Reflect.get(target, prop, rec);
            prop = prop.toLowerCase();
            // alias
            if (prop in aliasMap)
                prop = aliasMap[prop];
            // create new tracking
            if (!(prop in refs)) {
                if (/[+_-]/.test(prop)) {
                    const keys = prop.split(/[+_-]/g).map(i => i.trim());
                    refs[prop] = computed(() => keys.every(key => unref(proxy[key])));
                }
                else {
                    refs[prop] = ref(false);
                }
            }
            const r = Reflect.get(target, prop, rec);
            return useReactive ? unref(r) : r;
        },
    });
    return proxy;
}

const fnClone = (v) => JSON.parse(JSON.stringify(v));
const fnBypass = (v) => v;
const fnSetSource = (source, value) => source.value = value;
function defaultDump(clone) {
    return (clone ? isFunction(clone) ? clone : fnClone : fnBypass);
}
function defaultParse(clone) {
    return (clone ? isFunction(clone) ? clone : fnClone : fnBypass);
}
/**
 * Track the change history of a ref, also provides undo and redo functionality.
 *
 * @see https://vueuse.org/useManualRefHistory
 * @param source
 * @param options
 */
function useManualRefHistory(source, options = {}) {
    const { clone = false, dump = defaultDump(clone), parse = defaultParse(clone), setSource = fnSetSource, } = options;
    function _createHistoryRecord() {
        return markRaw({
            snapshot: dump(source.value),
            timestamp: timestamp(),
        });
    }
    const last = ref(_createHistoryRecord());
    const undoStack = ref([]);
    const redoStack = ref([]);
    const _setSource = (record) => {
        setSource(source, parse(record.snapshot));
        last.value = record;
    };
    const commit = () => {
        undoStack.value.unshift(last.value);
        last.value = _createHistoryRecord();
        if (options.capacity && undoStack.value.length > options.capacity)
            undoStack.value.splice(options.capacity, Infinity);
        if (redoStack.value.length)
            redoStack.value.splice(0, redoStack.value.length);
    };
    const clear = () => {
        undoStack.value.splice(0, undoStack.value.length);
        redoStack.value.splice(0, redoStack.value.length);
    };
    const undo = () => {
        const state = undoStack.value.shift();
        if (state) {
            redoStack.value.unshift(last.value);
            _setSource(state);
        }
    };
    const redo = () => {
        const state = redoStack.value.shift();
        if (state) {
            undoStack.value.unshift(last.value);
            _setSource(state);
        }
    };
    const reset = () => {
        _setSource(last.value);
    };
    const history = computed(() => [last.value, ...undoStack.value]);
    const canUndo = computed(() => undoStack.value.length > 0);
    const canRedo = computed(() => redoStack.value.length > 0);
    return {
        source,
        undoStack,
        redoStack,
        last,
        history,
        canUndo,
        canRedo,
        clear,
        commit,
        reset,
        undo,
        redo,
    };
}

/**
 * Automatically check if the ref exists and if it does run the cb fn
 */
function usingElRef(source, cb) {
    if (unref(source))
        cb(unref(source));
}
/**
 * Converts a TimeRange object to an array
 */
function timeRangeToArray(timeRanges) {
    let ranges = [];
    for (let i = 0; i < timeRanges.length; ++i)
        ranges = [...ranges, [timeRanges.start(i), timeRanges.end(i)]];
    return ranges;
}
/**
 * Converts a TextTrackList object to an array of `UseMediaTextTrack`
 */
function tracksToArray(tracks) {
    return Array.from(tracks)
        .map(({ label, kind, language, mode, activeCues, cues, inBandMetadataTrackDispatchType }, id) => ({ id, label, kind, language, mode, activeCues, cues, inBandMetadataTrackDispatchType }));
}
const defaultOptions = {
    src: '',
    tracks: [],
};
function useMediaControls(target, options = {}) {
    options = Object.assign(Object.assign({}, defaultOptions), options);
    const { document = defaultDocument, } = options;
    const currentTime = ref(0);
    const duration = ref(0);
    const seeking = ref(false);
    const buffering = ref(false);
    const volume = ref(1);
    const waiting = ref(false);
    const ended = ref(false);
    const playing = ref(false);
    const rate = ref(1);
    const stalled = ref(false);
    const buffered = ref([]);
    const tracks = ref([]);
    const selectedTrack = ref(-1);
    const isPictureInPicture = ref(false);
    const muted = ref(false);
    const supportsPictureInPicture = document && 'pictureInPictureEnabled' in document;
    // Events
    const sourceErrorEvent = createEventHook();
    /**
     * Disables the specified track. If no track is specified then
     * all tracks will be disabled
     *
     * @param track The id of the track to disable
     */
    const disableTrack = (track) => {
        usingElRef(target, (el) => {
            if (track) {
                const id = isNumber(track) ? track : track.id;
                el.textTracks[id].mode = 'disabled';
            }
            else {
                for (let i = 0; i < el.textTracks.length; ++i)
                    el.textTracks[i].mode = 'disabled';
            }
            selectedTrack.value = -1;
        });
    };
    /**
     * Enables the specified track and disables the
     * other tracks unless otherwise specified
     *
     * @param track The track of the id of the track to enable
     * @param disableTracks Disable all other tracks
     */
    const enableTrack = (track, disableTracks = true) => {
        usingElRef(target, (el) => {
            const id = isNumber(track) ? track : track.id;
            if (disableTracks)
                disableTrack();
            el.textTracks[id].mode = 'showing';
            selectedTrack.value = id;
        });
    };
    /**
     * Toggle picture in picture mode for the player.
     */
    const togglePictureInPicture = () => {
        return new Promise((resolve, reject) => {
            usingElRef(target, async (el) => {
                if (supportsPictureInPicture) {
                    if (!isPictureInPicture.value) {
                        el.requestPictureInPicture()
                            .then(resolve)
                            .catch(reject);
                    }
                    else {
                        document.exitPictureInPicture()
                            .then(resolve)
                            .catch(reject);
                    }
                }
            });
        });
    };
    /**
     * This will automatically inject sources to the media element. The sources will be
     * appended as children to the media element as `<source>` elements.
     */
    watchEffect(() => {
        if (!document)
            return;
        const el = unref(target);
        if (!el)
            return;
        const src = unref(options.src);
        let sources = [];
        if (!src)
            return;
        // Merge sources into an array
        if (isString(src))
            sources = [{ src }];
        else if (Array.isArray(src))
            sources = src;
        else if (isObject(src))
            sources = [src];
        // Clear the sources
        el.querySelectorAll('source').forEach((e) => {
            e.removeEventListener('error', sourceErrorEvent.trigger);
            e.remove();
        });
        // Add new sources
        sources.forEach(({ src, type }) => {
            const source = document.createElement('source');
            source.setAttribute('src', src);
            source.setAttribute('type', type || '');
            source.addEventListener('error', sourceErrorEvent.trigger);
            el.appendChild(source);
        });
        // Finally, load the new sources.
        el.load();
    });
    // Remove source error listeners
    tryOnUnmounted(() => {
        const el = unref(target);
        if (!el)
            return;
        el.querySelectorAll('source').forEach(e => e.removeEventListener('error', sourceErrorEvent.trigger));
    });
    /**
     * Watch volume and change player volume when volume prop changes
     */
    watch(volume, (vol) => {
        const el = unref(target);
        if (!el)
            return;
        el.volume = vol;
    });
    watch(muted, (mute) => {
        const el = unref(target);
        if (!el)
            return;
        el.muted = mute;
    });
    /**
     * Load Tracks
     */
    watchEffect(() => {
        if (!document)
            return;
        const textTracks = unref(options.tracks);
        const el = unref(target);
        if (!textTracks || !textTracks.length || !el)
            return;
        /**
         * The MediaAPI provides an API for adding text tracks, but they don't currently
         * have an API for removing text tracks, so instead we will just create and remove
         * the tracks manually using the HTML api.
         */
        el.querySelectorAll('track').forEach(e => e.remove());
        textTracks.forEach(({ default: isDefault, kind, label, src, srcLang }, i) => {
            const track = document.createElement('track');
            track.default = isDefault || false;
            track.kind = kind;
            track.label = label;
            track.src = src;
            track.srclang = srcLang;
            if (track.default)
                selectedTrack.value = i;
            el.appendChild(track);
        });
    });
    /**
     * This will allow us to update the current time from the timeupdate event
     * without setting the medias current position, but if the user changes the
     * current time via the ref, then the media will seek.
     *
     * If we did not use an ignorable watch, then the current time update from
     * the timeupdate event would cause the media to stutter.
     */
    const { ignoreUpdates: ignoreCurrentTimeUpdates } = ignorableWatch(currentTime, (time) => {
        const el = unref(target);
        if (!el)
            return;
        el.currentTime = time;
    });
    /**
     * Using an ignorable watch so we can control the play state using a ref and not
     * a function
     */
    const { ignoreUpdates: ignorePlayingUpdates } = ignorableWatch(playing, (isPlaying) => {
        const el = unref(target);
        if (!el)
            return;
        isPlaying ? el.play() : el.pause();
    });
    useEventListener(target, 'timeupdate', () => ignoreCurrentTimeUpdates(() => currentTime.value = (unref(target)).currentTime));
    useEventListener(target, 'durationchange', () => duration.value = (unref(target)).duration);
    useEventListener(target, 'progress', () => buffered.value = timeRangeToArray((unref(target)).buffered));
    useEventListener(target, 'seeking', () => seeking.value = true);
    useEventListener(target, 'seeked', () => seeking.value = false);
    useEventListener(target, 'waiting', () => waiting.value = true);
    useEventListener(target, 'playing', () => waiting.value = false);
    useEventListener(target, 'ratechange', () => rate.value = (unref(target)).playbackRate);
    useEventListener(target, 'stalled', () => stalled.value = true);
    useEventListener(target, 'ended', () => ended.value = true);
    useEventListener(target, 'pause', () => ignorePlayingUpdates(() => playing.value = false));
    useEventListener(target, 'play', () => ignorePlayingUpdates(() => playing.value = true));
    useEventListener(target, 'enterpictureinpicture', () => isPictureInPicture.value = true);
    useEventListener(target, 'leavepictureinpicture', () => isPictureInPicture.value = false);
    useEventListener(target, 'volumechange', () => {
        const el = unref(target);
        if (!el)
            return;
        volume.value = el.volume;
        muted.value = el.muted;
    });
    /**
     * The following listeners need to listen to a nested
     * object on the target, so we will have to use a nested
     * watch and manually remove the listeners
     */
    const listeners = [];
    const stop = watch([target], () => {
        const el = unref(target);
        if (!el)
            return;
        stop();
        listeners[0] = useEventListener(el.textTracks, 'addtrack', () => tracks.value = tracksToArray(el.textTracks));
        listeners[1] = useEventListener(el.textTracks, 'removetrack', () => tracks.value = tracksToArray(el.textTracks));
        listeners[2] = useEventListener(el.textTracks, 'change', () => tracks.value = tracksToArray(el.textTracks));
    });
    // Remove text track listeners
    tryOnUnmounted(() => listeners.forEach(listener => listener()));
    return {
        currentTime,
        duration,
        buffering,
        waiting,
        seeking,
        ended,
        stalled,
        buffered,
        playing,
        // Volume
        volume,
        muted,
        // Tracks
        tracks,
        selectedTrack,
        enableTrack,
        disableTrack,
        // Picture in Picture
        supportsPictureInPicture,
        togglePictureInPicture,
        isPictureInPicture,
        // Events
        onSourceError: sourceErrorEvent.on,
    };
}

/**
 * Reactive mouse position.
 *
 * @see https://vueuse.org/useMouse
 * @param options
 */
function useMouse(options = {}) {
    const { touch = true, resetOnTouchEnds = false, initialValue = { x: 0, y: 0 }, window = defaultWindow, } = options;
    const x = ref(initialValue.x);
    const y = ref(initialValue.y);
    const sourceType = ref(null);
    const mouseHandler = (event) => {
        x.value = event.pageX;
        y.value = event.pageY;
        sourceType.value = 'mouse';
    };
    const reset = () => {
        x.value = initialValue.x;
        y.value = initialValue.y;
    };
    const touchHandler = (event) => {
        if (event.touches.length > 0) {
            x.value = event.touches[0].clientX;
            y.value = event.touches[0].clientY;
            sourceType.value = 'touch';
        }
    };
    if (window) {
        useEventListener(window, 'mousemove', mouseHandler, { passive: true });
        if (touch) {
            useEventListener(window, 'touchstart', touchHandler, { passive: true });
            useEventListener(window, 'touchmove', touchHandler, { passive: true });
            if (resetOnTouchEnds)
                useEventListener(window, 'touchend', reset, { passive: true });
        }
    }
    return {
        x,
        y,
        sourceType,
    };
}

/**
 * Reactive mouse position related to an element.
 *
 * @see https://vueuse.org/useMouseInElement
 * @param target
 * @param options
 */
function useMouseInElement(target, options = {}) {
    const { handleOutside = true, window = defaultWindow, } = options;
    const { x, y, sourceType } = useMouse(options);
    const targetRef = ref(target !== null && target !== void 0 ? target : window === null || window === void 0 ? void 0 : window.document.body);
    const elementX = ref(0);
    const elementY = ref(0);
    const elementPositionX = ref(0);
    const elementPositionY = ref(0);
    const elementHeight = ref(0);
    const elementWidth = ref(0);
    const isOutside = ref(false);
    let stop = () => { };
    if (window) {
        stop = watch([targetRef, x, y], () => {
            const el = unrefElement(targetRef);
            if (!el)
                return;
            const { left, top, width, height, } = el.getBoundingClientRect();
            elementPositionX.value = left + window.pageXOffset;
            elementPositionY.value = top + window.pageYOffset;
            elementHeight.value = height;
            elementWidth.value = width;
            const elX = x.value - elementPositionX.value;
            const elY = y.value - elementPositionY.value;
            isOutside.value = elX < 0 || elY < 0 || elX > elementWidth.value || elY > elementHeight.value;
            if (handleOutside || !isOutside.value) {
                elementX.value = elX;
                elementY.value = elY;
            }
        }, { immediate: true });
    }
    return {
        x,
        y,
        sourceType,
        elementX,
        elementY,
        elementPositionX,
        elementPositionY,
        elementHeight,
        elementWidth,
        isOutside,
        stop,
    };
}

/**
 * Reactive mouse position.
 *
 * @see https://vueuse.org/useMousePressed
 * @param options
 */
function useMousePressed(options = {}) {
    const { touch = true, initialValue = false, window = defaultWindow, } = options;
    const pressed = ref(initialValue);
    const sourceType = ref(null);
    if (!window) {
        return {
            pressed,
            sourceType,
        };
    }
    const onReleased = () => {
        pressed.value = false;
        sourceType.value = null;
    };
    const target = computed(() => unrefElement(options.target) || window);
    useEventListener(window, 'mouseleave', onReleased, { passive: true });
    useEventListener(window, 'mouseup', onReleased, { passive: true });
    useEventListener(target, 'mousedown', () => {
        pressed.value = true;
        sourceType.value = 'mouse';
    }, { passive: true });
    if (touch) {
        useEventListener(window, 'touchend', onReleased, { passive: true });
        useEventListener(window, 'touchcancel', onReleased, { passive: true });
        useEventListener(target, 'touchstart', () => {
            pressed.value = true;
            sourceType.value = 'touch';
        }, { passive: true });
    }
    return {
        pressed,
        sourceType,
    };
}

/**
 * Watch for changes being made to the DOM tree.
 *
 * @see https://vueuse.org/useMutationObserver
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver MutationObserver MDN
 * @param target
 * @param callback
 * @param options
 */
function useMutationObserver(target, callback, options = {}) {
    const { window = defaultWindow } = options, mutationOptions = __rest(options, ["window"]);
    let observer;
    const isSupported = window && 'IntersectionObserver' in window;
    const cleanup = () => {
        if (observer) {
            observer.disconnect();
            observer = undefined;
        }
    };
    const stopWatch = watch(() => unrefElement(target), (el) => {
        cleanup();
        if (isSupported && window && el) {
            // @ts-expect-error missing type
            observer = new window.MutationObserver(callback);
            observer.observe(el, mutationOptions);
        }
    }, { immediate: true });
    const stop = () => {
        cleanup();
        stopWatch();
    };
    tryOnUnmounted(stop);
    return {
        isSupported,
        stop,
    };
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
/**
 * Reactive Network status.
 *
 * @see https://vueuse.org/useNetwork
 * @param options
 */
function useNetwork(options = {}) {
    const { window = defaultWindow } = options;
    const navigator = window === null || window === void 0 ? void 0 : window.navigator;
    const isSupported = Boolean(navigator && 'connection' in navigator);
    const isOnline = ref(true);
    const saveData = ref(false);
    const offlineAt = ref(undefined);
    const downlink = ref(undefined);
    const downlinkMax = ref(undefined);
    const effectiveType = ref(undefined);
    const type = ref('unknown');
    const connection = isSupported && navigator.connection;
    function updateNetworkInformation() {
        if (!navigator)
            return;
        isOnline.value = navigator.onLine;
        offlineAt.value = isOnline.value ? undefined : Date.now();
        if (connection) {
            downlink.value = connection.downlink;
            downlinkMax.value = connection.downlinkMax;
            effectiveType.value = connection.effectiveType;
            saveData.value = connection.saveData;
            type.value = connection.type;
        }
    }
    if (window) {
        useEventListener(window, 'offline', () => {
            isOnline.value = false;
            offlineAt.value = Date.now();
        });
        useEventListener(window, 'online', () => {
            isOnline.value = true;
        });
    }
    if (connection)
        useEventListener(connection, 'change', updateNetworkInformation, false);
    updateNetworkInformation();
    return {
        isSupported,
        isOnline,
        saveData,
        offlineAt,
        downlink,
        downlinkMax,
        effectiveType,
        type,
    };
}

/**
 * Call function on every `requestAnimationFrame`. With controls of pausing and resuming.
 *
 * @see https://vueuse.org/useRafFn
 * @param fn
 * @param options
 */
function useRafFn(fn, options = {}) {
    const { immediate = true, window = defaultWindow, } = options;
    const isActive = ref(false);
    function loop() {
        if (!isActive.value)
            return;
        fn();
        if (window)
            window.requestAnimationFrame(loop);
    }
    function resume() {
        if (!isActive.value) {
            isActive.value = true;
            loop();
        }
    }
    function pause() {
        isActive.value = false;
    }
    if (immediate)
        resume();
    tryOnUnmounted(pause);
    return {
        isActive,
        pause,
        resume,
    };
}

function useNow(options = {}) {
    const { controls: exposeControls = false, interval = 'requestAnimationFrame', } = options;
    const now = ref(new Date());
    const update = () => now.value = new Date();
    const controls = interval === 'requestAnimationFrame'
        ? useRafFn(update, { immediate: true })
        : useIntervalFn(update, interval, { immediate: true });
    if (exposeControls) {
        return Object.assign({ now }, controls);
    }
    else {
        return now;
    }
}

/**
 * Reactive online state.
 *
 * @see https://vueuse.org/useOnline
 * @param options
 */
function useOnline(options = {}) {
    const { isOnline } = useNetwork(options);
    return isOnline;
}

/**
 * Reactive state to show whether mouse leaves the page.
 *
 * @see https://vueuse.org/usePageLeave
 * @param options
 */
function usePageLeave(options = {}) {
    const { window = defaultWindow } = options;
    const isLeft = ref(false);
    const handler = (event) => {
        if (!window)
            return;
        event = event || window.event;
        // @ts-ignore
        const from = event.relatedTarget || event.toElement;
        isLeft.value = !from;
    };
    if (window) {
        useEventListener(window, 'mouseout', handler, { passive: true });
        useEventListener(window.document, 'mouseleave', handler, { passive: true });
        useEventListener(window.document, 'mouseenter', handler, { passive: true });
    }
    return isLeft;
}

/**
 * Create parallax effect easily. It uses `useDeviceOrientation` and fallback to `useMouse`
 * if orientation is not supported.
 *
 * @param target
 * @param options
 */
function useParallax(target, options = {}) {
    const { deviceOrientationTiltAdjust = i => i, deviceOrientationRollAdjust = i => i, mouseTiltAdjust = i => i, mouseRollAdjust = i => i, window = defaultWindow, } = options;
    const orientation = reactive(useDeviceOrientation({ window }));
    const { elementX: x, elementY: y, elementWidth: width, elementHeight: height, } = useMouseInElement(target, { handleOutside: false, window });
    const source = computed(() => {
        if (orientation.isSupported
            && ((orientation.alpha != null && orientation.alpha !== 0) || (orientation.gamma != null && orientation.gamma !== 0)))
            return 'deviceOrientation';
        return 'mouse';
    });
    const roll = computed(() => {
        if (source.value === 'deviceOrientation') {
            const value = -orientation.beta / 90;
            return deviceOrientationRollAdjust(value);
        }
        else {
            const value = -(y.value - height.value / 2) / height.value;
            return mouseRollAdjust(value);
        }
    });
    const tilt = computed(() => {
        if (source.value === 'deviceOrientation') {
            const value = orientation.gamma / 90;
            return deviceOrientationTiltAdjust(value);
        }
        else {
            const value = (x.value - width.value / 2) / width.value;
            return mouseTiltAdjust(value);
        }
    });
    return { roll, tilt, source };
}

var SwipeDirection;
(function (SwipeDirection) {
    SwipeDirection["UP"] = "UP";
    SwipeDirection["RIGHT"] = "RIGHT";
    SwipeDirection["DOWN"] = "DOWN";
    SwipeDirection["LEFT"] = "LEFT";
    SwipeDirection["NONE"] = "NONE";
})(SwipeDirection || (SwipeDirection = {}));
/**
 * Reactive swipe detection.
 *
 * @see https://vueuse.org/useSwipe
 * @param target
 * @param options
 */
function useSwipe(target, options = {}) {
    const { threshold = 50, onSwipe, onSwipeEnd, onSwipeStart, passive = true, window = defaultWindow, } = options;
    const coordsStart = reactive({ x: 0, y: 0 });
    const coordsEnd = reactive({ x: 0, y: 0 });
    const diffX = computed(() => coordsStart.x - coordsEnd.x);
    const diffY = computed(() => coordsStart.y - coordsEnd.y);
    const { max, abs } = Math;
    const isThresholdExceeded = computed(() => max(abs(diffX.value), abs(diffY.value)) >= threshold);
    const isSwiping = ref(false);
    const direction = computed(() => {
        if (!isThresholdExceeded.value)
            return SwipeDirection.NONE;
        if (abs(diffX.value) > abs(diffY.value)) {
            return diffX.value > 0
                ? SwipeDirection.LEFT
                : SwipeDirection.RIGHT;
        }
        else {
            return diffY.value > 0
                ? SwipeDirection.UP
                : SwipeDirection.DOWN;
        }
    });
    const getTouchEventCoords = (e) => [e.touches[0].clientX, e.touches[0].clientY];
    const updateCoordsStart = (x, y) => {
        coordsStart.x = x;
        coordsStart.y = y;
    };
    const updateCoordsEnd = (x, y) => {
        coordsEnd.x = x;
        coordsEnd.y = y;
    };
    let listenerOptions;
    const isPassiveEventSupported = checkPassiveEventSupport(window === null || window === void 0 ? void 0 : window.document);
    if (!passive)
        listenerOptions = isPassiveEventSupported ? { passive: false, capture: true } : { capture: true };
    else
        listenerOptions = isPassiveEventSupported ? { passive: true } : { capture: false };
    const stops = [
        useEventListener(target, 'touchstart', (e) => {
            if (listenerOptions.capture && !listenerOptions.passive)
                e.preventDefault();
            const [x, y] = getTouchEventCoords(e);
            updateCoordsStart(x, y);
            updateCoordsEnd(x, y);
            onSwipeStart === null || onSwipeStart === void 0 ? void 0 : onSwipeStart(e);
        }, listenerOptions),
        useEventListener(target, 'touchmove', (e) => {
            const [x, y] = getTouchEventCoords(e);
            updateCoordsEnd(x, y);
            if (!isSwiping.value && isThresholdExceeded.value)
                isSwiping.value = true;
            if (isSwiping.value)
                onSwipe === null || onSwipe === void 0 ? void 0 : onSwipe(e);
        }, listenerOptions),
        useEventListener(target, 'touchend', (e) => {
            if (isSwiping.value)
                onSwipeEnd === null || onSwipeEnd === void 0 ? void 0 : onSwipeEnd(e, direction.value);
            isSwiping.value = false;
        }, listenerOptions),
    ];
    const stop = () => stops.forEach(s => s());
    return {
        isPassiveEventSupported,
        isSwiping,
        direction,
        coordsStart,
        coordsEnd,
        lengthX: diffX,
        lengthY: diffY,
        stop,
    };
}
/**
 * This is a polyfill for passive event support detection
 * @see https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 */
function checkPassiveEventSupport(document) {
    if (!document)
        return false;
    let supportsPassive = false;
    const optionsBlock = {
        get passive() {
            supportsPassive = true;
            return false;
        },
    };
    document.addEventListener('x', noop, optionsBlock);
    document.removeEventListener('x', noop);
    return supportsPassive;
}

/**
 * Reactive swipe detection based on PointerEvents.
 *
 * @see https://vueuse.org/usePointerSwipe
 * @param target
 * @param options
 */
function usePointerSwipe(target, options = {}) {
    const targetRef = ref(target);
    const { threshold = 50, onSwipe, onSwipeEnd, onSwipeStart, } = options;
    const posStart = reactive({ x: 0, y: 0 });
    const updatePosStart = (x, y) => {
        posStart.x = x;
        posStart.y = y;
    };
    const posEnd = reactive({ x: 0, y: 0 });
    const updatePosEnd = (x, y) => {
        posEnd.x = x;
        posEnd.y = y;
    };
    const distanceX = computed(() => posStart.x - posEnd.x);
    const distanceY = computed(() => posStart.y - posEnd.y);
    const { max, abs } = Math;
    const isThresholdExceeded = computed(() => max(abs(distanceX.value), abs(distanceY.value)) >= threshold);
    const isSwiping = ref(false);
    const isPointerDown = ref(false);
    const direction = computed(() => {
        if (!isThresholdExceeded.value)
            return SwipeDirection.NONE;
        if (abs(distanceX.value) > abs(distanceY.value)) {
            return distanceX.value > 0
                ? SwipeDirection.LEFT
                : SwipeDirection.RIGHT;
        }
        else {
            return distanceY.value > 0
                ? SwipeDirection.UP
                : SwipeDirection.DOWN;
        }
    });
    const stops = [
        useEventListener(target, 'pointerdown', (e) => {
            var _a, _b;
            isPointerDown.value = true;
            // Disable scroll on for TouchEvents
            (_a = targetRef.value) === null || _a === void 0 ? void 0 : _a.setAttribute('style', 'touch-action: none');
            // Future pointer events will be retargeted to target until pointerup/cancel
            (_b = targetRef.value) === null || _b === void 0 ? void 0 : _b.setPointerCapture(e.pointerId);
            const { clientX: x, clientY: y } = e;
            updatePosStart(x, y);
            updatePosEnd(x, y);
            onSwipeStart === null || onSwipeStart === void 0 ? void 0 : onSwipeStart(e);
        }),
        useEventListener(target, 'pointermove', (e) => {
            if (!isPointerDown.value)
                return;
            const { clientX: x, clientY: y } = e;
            updatePosEnd(x, y);
            if (!isSwiping.value && isThresholdExceeded.value)
                isSwiping.value = true;
            if (isSwiping.value)
                onSwipe === null || onSwipe === void 0 ? void 0 : onSwipe(e);
        }),
        useEventListener(target, 'pointerup', (e) => {
            var _a;
            if (isSwiping.value)
                onSwipeEnd === null || onSwipeEnd === void 0 ? void 0 : onSwipeEnd(e, direction.value);
            isPointerDown.value = false;
            isSwiping.value = false;
            (_a = targetRef.value) === null || _a === void 0 ? void 0 : _a.setAttribute('style', 'touch-action: initial');
        }),
    ];
    const stop = () => stops.forEach(s => s());
    return {
        isSwiping: readonly(isSwiping),
        direction: readonly(direction),
        posStart: readonly(posStart),
        posEnd: readonly(posEnd),
        distanceX,
        distanceY,
        stop,
    };
}

/**
 * Reactive prefers-color-scheme media query.
 *
 * @see https://vueuse.org/usePreferredColorScheme
 * @param [options]
 */
function usePreferredColorScheme(options) {
    const isLight = useMediaQuery('(prefers-color-scheme: light)', options);
    const isDark = useMediaQuery('(prefers-color-scheme: dark)', options);
    return computed(() => {
        if (isDark.value)
            return 'dark';
        if (isLight.value)
            return 'light';
        return 'no-preference';
    });
}

/**
 * Reactive Navigator Languages.
 *
 * @see https://vueuse.org/usePreferredLanguages
 * @param options
 */
function usePreferredLanguages(options = {}) {
    const { window = defaultWindow } = options;
    if (!window)
        return ref(['en']);
    const navigator = window.navigator;
    const value = ref(navigator.languages);
    useEventListener(window, 'languagechange', () => {
        value.value = navigator.languages;
    });
    return value;
}

/**
 * Track the change history of a ref, also provides undo and redo functionality.
 *
 * @see https://vueuse.org/useRefHistory
 * @param source
 * @param options
 */
function useRefHistory(source, options = {}) {
    const { deep = false, flush = 'pre', } = options;
    const { eventFilter, pause, resume: resumeTracking, isActive: isTracking } = pausableFilter();
    const { ignoreUpdates, ignorePrevAsyncUpdates, stop } = ignorableWatch(source, commit, { deep, flush, eventFilter });
    function setSource(source, value) {
        // Support changes that are done after the last history operation
        // examples:
        //   undo, modify
        //   undo, undo, modify
        // If there were already changes in the state, they will be ignored
        // examples:
        //   modify, undo
        //   undo, modify, undo
        ignorePrevAsyncUpdates();
        ignoreUpdates(() => {
            source.value = value;
        });
    }
    const manualHistory = useManualRefHistory(source, Object.assign(Object.assign({}, options), { clone: options.clone || deep, setSource }));
    const { clear, commit: manualCommit } = manualHistory;
    function commit() {
        // This guard only applies for flush 'pre' and 'post'
        // If the user triggers a commit manually, then reset the watcher
        // so we do not trigger an extra commit in the async watcher
        ignorePrevAsyncUpdates();
        manualCommit();
    }
    function resume(commitNow) {
        resumeTracking();
        if (commitNow)
            commit();
    }
    function batch(fn) {
        let canceled = false;
        const cancel = () => canceled = true;
        ignoreUpdates(() => {
            fn(cancel);
        });
        if (!canceled)
            commit();
    }
    function dispose() {
        stop();
        clear();
    }
    return Object.assign(Object.assign({}, manualHistory), { isTracking,
        pause,
        resume,
        commit,
        batch,
        dispose });
}

/**
 * Async script tag loading.
 *
 * @see https://vueuse.org/useScriptTag
 * @param src
 */
function useScriptTag(src, onLoaded = noop, options = {}) {
    const { immediate = true, manual = false, type = 'text/javascript', async = true, crossOrigin, referrerPolicy, noModule, defer, document = defaultDocument, } = options;
    const scriptTag = ref(null);
    let _promise = null;
    /**
     * Load the script specified via `src`.
     *
     * @param waitForScriptLoad Whether if the Promise should resolve once the "load" event is emitted by the <script> attribute, or right after appending it to the DOM.
     * @returns Promise<HTMLScriptElement>
     */
    const loadScript = (waitForScriptLoad) => new Promise((resolve, reject) => {
        // Some little closure for resolving the Promise.
        const resolveWithElement = (el) => {
            scriptTag.value = el;
            resolve(el);
            return el;
        };
        // Check if document actually exists, otherwise resolve the Promise (SSR Support).
        if (!document) {
            resolve(false);
            return;
        }
        // Local variable defining if the <script> tag should be appended or not.
        let shouldAppend = false;
        let el = document.querySelector(`script[src="${src}"]`);
        // Script tag not found, preparing the element for appending
        if (!el) {
            el = document.createElement('script');
            el.type = type;
            el.async = async;
            el.src = unref(src);
            // Optional attributes
            if (defer)
                el.defer = defer;
            if (crossOrigin)
                el.crossOrigin = crossOrigin;
            if (noModule)
                el.noModule = noModule;
            if (referrerPolicy)
                el.referrerPolicy = referrerPolicy;
            // Enables shouldAppend
            shouldAppend = true;
        }
        // Script tag already exists, resolve the loading Promise with it.
        else if (el.hasAttribute('data-loaded')) {
            resolveWithElement(el);
        }
        // Event listeners
        el.addEventListener('error', event => reject(event));
        el.addEventListener('abort', event => reject(event));
        el.addEventListener('load', () => {
            el.setAttribute('data-loaded', 'true');
            onLoaded(el);
            resolveWithElement(el);
        });
        // Append the <script> tag to head.
        if (shouldAppend)
            el = document.head.appendChild(el);
        // If script load awaiting isn't needed, we can resolve the Promise.
        if (!waitForScriptLoad)
            resolveWithElement(el);
    });
    /**
     * Exposed singleton wrapper for `loadScript`, avoiding calling it twice.
     *
     * @param waitForScriptLoad Whether if the Promise should resolve once the "load" event is emitted by the <script> attribute, or right after appending it to the DOM.
     * @returns Promise<HTMLScriptElement>
     */
    const load = (waitForScriptLoad = true) => {
        if (!_promise)
            _promise = loadScript(waitForScriptLoad);
        return _promise;
    };
    /**
     * Unload the script specified by `src`.
     */
    const unload = () => {
        if (!document)
            return;
        _promise = null;
        if (scriptTag.value) {
            document.head.removeChild(scriptTag.value);
            scriptTag.value = null;
        }
    };
    if (immediate && !manual)
        tryOnMounted(load);
    if (!manual)
        tryOnUnmounted(unload);
    return { scriptTag, load, unload };
}

/**
 * Reactive SessionStorage.
 *
 * @see https://vueuse.org/useSessionStorage
 * @param key
 * @param defaultValue
 * @param options
 */
function useSessionStorage(key, defaultValue, options = {}) {
    const { window = defaultWindow } = options;
    return useStorage(key, defaultValue, window === null || window === void 0 ? void 0 : window.sessionStorage, options);
}

/**
 * Reactive Web Share API.
 *
 * @see https://vueuse.org/useShare
 * @param shareOptions
 * @param options
 */
function useShare(shareOptions = {}, options = {}) {
    const { navigator = defaultNavigator } = options;
    const _navigator = navigator;
    const isSupported = _navigator && 'canShare' in _navigator;
    const share = async (overrideOptions = {}) => {
        if (isSupported) {
            const data = Object.assign(Object.assign({}, unref(shareOptions)), unref(overrideOptions));
            let granted = true;
            if (data.files && _navigator.canShare)
                granted = _navigator.canShare({ files: data.files });
            if (granted)
                return _navigator.share(data);
        }
    };
    return {
        isSupported,
        share,
    };
}

// ported from https://www.reddit.com/r/vuejs/comments/jksizl/speech_recognition_as_a_vue_3_hook
/**
 * Reactive SpeechRecognition.
 *
 * @see https://vueuse.org/useSpeechRecognition
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition SpeechRecognition
 * @param options
 */
function useSpeechRecognition(options = {}) {
    const { lang = 'en-US', interimResults = true, continuous = true, window = defaultWindow, } = options;
    const isListening = ref(false);
    const isFinal = ref(false);
    const result = ref('');
    const error = shallowRef(undefined);
    const toggle = (value = !isListening.value) => {
        isListening.value = value;
    };
    const start = () => {
        isListening.value = true;
    };
    const stop = () => {
        isListening.value = false;
    };
    const SpeechRecognition = window && (window.SpeechRecognition || window.webkitSpeechRecognition);
    const isSupported = Boolean(SpeechRecognition);
    let recognition;
    if (isSupported) {
        recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;
        recognition.onstart = () => {
            isFinal.value = false;
        };
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => {
                isFinal.value = result.isFinal;
                return result[0];
            })
                .map(result => result.transcript)
                .join('');
            result.value = transcript;
            error.value = undefined;
        };
        recognition.onerror = (event) => {
            error.value = event;
        };
        recognition.onend = () => {
            isListening.value = false;
        };
        watch(isListening, () => {
            if (isListening.value)
                recognition.start();
            else
                recognition.stop();
        });
    }
    tryOnUnmounted(() => {
        isListening.value = false;
    });
    return {
        isSupported,
        isListening,
        isFinal,
        recognition,
        result,
        error,
        toggle,
        start,
        stop,
    };
}

const UNITS = [
    { max: 60000, value: 1000, name: 'second' },
    { max: 2760000, value: 60000, name: 'minute' },
    { max: 72000000, value: 3600000, name: 'hour' },
    { max: 518400000, value: 86400000, name: 'day' },
    { max: 2419200000, value: 604800000, name: 'week' },
    { max: 28512000000, value: 2592000000, name: 'month' },
    { max: Infinity, value: 31536000000, name: 'year' },
];
const DEFAULT_MESSAGES = {
    justNow: 'just now',
    past: n => n.match(/\d/) ? `${n} ago` : n,
    future: n => n.match(/\d/) ? `in ${n}` : n,
    month: (n, past) => n === 1
        ? past
            ? 'last month'
            : 'next month'
        : `${n} month${n > 1 ? 's' : ''}`,
    year: (n, past) => n === 1
        ? past
            ? 'last year'
            : 'next year'
        : `${n} year${n > 1 ? 's' : ''}`,
    day: (n, past) => n === 1
        ? past
            ? 'yesterday'
            : 'tomorrow'
        : `${n} day${n > 1 ? 's' : ''}`,
    week: (n, past) => n === 1
        ? past
            ? 'last week'
            : 'next week'
        : `${n} week${n > 1 ? 's' : ''}`,
    hour: n => `${n} hour${n > 1 ? 's' : ''}`,
    minute: n => `${n} minute${n > 1 ? 's' : ''}`,
    second: n => `${n} second${n > 1 ? 's' : ''}`,
};
const DEFAULT_FORMATTER = (date) => date.toISOString().slice(0, 10);
function useTimeAgo(time, options = {}) {
    const { controls: exposeControls = false, max, updateInterval = 30000, messages = DEFAULT_MESSAGES, fullDateFormatter = DEFAULT_FORMATTER, } = options;
    const { abs, round } = Math;
    const _a = useNow({ interval: updateInterval, controls: true }), { now } = _a, controls = __rest(_a, ["now"]);
    function getTimeago(from, now) {
        var _a;
        const diff = +now - +from;
        const absDiff = abs(diff);
        // less than a minute
        if (absDiff < 60000)
            return messages.justNow;
        if (typeof max === 'number' && absDiff > max)
            return fullDateFormatter(new Date(from));
        if (typeof max === 'string') {
            const unitMax = (_a = UNITS.find(i => i.name === max)) === null || _a === void 0 ? void 0 : _a.max;
            if (unitMax && absDiff > unitMax)
                return fullDateFormatter(new Date(from));
        }
        for (const unit of UNITS) {
            if (absDiff < unit.max)
                return format(diff, unit);
        }
    }
    function applyFormat(name, val, isPast) {
        const formatter = messages[name];
        if (typeof formatter === 'function')
            return formatter(val, isPast);
        return formatter.replace('{0}', val.toString());
    }
    function format(diff, unit) {
        const val = round(abs(diff) / unit.value);
        const past = diff > 0;
        const str = applyFormat(unit.name, val, past);
        return applyFormat(past ? 'past' : 'future', str, past);
    }
    const timeAgo = computed(() => getTimeago(new Date(unref(time)), unref(now.value)));
    if (exposeControls) {
        return Object.assign({ timeAgo }, controls);
    }
    else {
        return timeAgo;
    }
}

function useTimestamp(options = {}) {
    const { controls: exposeControls = false, offset = 0, interval = 'requestAnimationFrame', } = options;
    const ts = ref(timestamp() + offset);
    const update = () => ts.value = timestamp() + offset;
    const controls = interval === 'requestAnimationFrame'
        ? useRafFn(update, { immediate: true })
        : useIntervalFn(update, interval, { immediate: true });
    if (exposeControls) {
        return Object.assign({ timestamp: ts }, controls);
    }
    else {
        return ts;
    }
}

/**
 * Reactive document title.
 *
 * @see https://vueuse.org/useTitle
 * @param newTitle
 * @param options
 */
function useTitle(newTitle = null, options = {}) {
    var _a, _b;
    const { document = defaultDocument, observe = false, } = options;
    const title = ref((_a = newTitle !== null && newTitle !== void 0 ? newTitle : document === null || document === void 0 ? void 0 : document.title) !== null && _a !== void 0 ? _a : null);
    watch(title, (t, o) => {
        if (isString(t) && t !== o && document)
            document.title = t;
    }, { immediate: true });
    if (observe && document) {
        useMutationObserver((_b = document.head) === null || _b === void 0 ? void 0 : _b.querySelector('title'), () => {
            if (document && document.title !== title.value)
                title.value = document.title;
        }, { childList: true });
    }
    return title;
}

/**
 * Common transitions
 *
 * @see https://easings.net
 */
const TransitionPresets = {
    linear: identity,
    easeInSine: [0.12, 0, 0.39, 0],
    easeOutSine: [0.61, 1, 0.88, 1],
    easeInOutSine: [0.37, 0, 0.63, 1],
    easeInQuad: [0.11, 0, 0.5, 0],
    easeOutQuad: [0.5, 1, 0.89, 1],
    easeInOutQuad: [0.45, 0, 0.55, 1],
    easeInCubic: [0.32, 0, 0.67, 0],
    easeOutCubic: [0.33, 1, 0.68, 1],
    easeInOutCubic: [0.65, 0, 0.35, 1],
    easeInQuart: [0.5, 0, 0.75, 0],
    easeOutQuart: [0.25, 1, 0.5, 1],
    easeInOutQuart: [0.76, 0, 0.24, 1],
    easeInQuint: [0.64, 0, 0.78, 0],
    easeOutQuint: [0.22, 1, 0.36, 1],
    easeInOutQuint: [0.83, 0, 0.17, 1],
    easeInExpo: [0.7, 0, 0.84, 0],
    easeOutExpo: [0.16, 1, 0.3, 1],
    easeInOutExpo: [0.87, 0, 0.13, 1],
    easeInCirc: [0.55, 0, 1, 0.45],
    easeOutCirc: [0, 0.55, 0.45, 1],
    easeInOutCirc: [0.85, 0, 0.15, 1],
    easeInBack: [0.36, 0, 0.66, -0.56],
    easeOutBack: [0.34, 1.56, 0.64, 1],
    easeInOutBack: [0.68, -0.6, 0.32, 1.6],
};
/**
 * Create an easing function from cubic bezier points.
 */
function createEasingFunction([p0, p1, p2, p3]) {
    const a = (a1, a2) => 1 - 3 * a2 + 3 * a1;
    const b = (a1, a2) => 3 * a2 - 6 * a1;
    const c = (a1) => 3 * a1;
    const calcBezier = (t, a1, a2) => ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
    const getSlope = (t, a1, a2) => 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1);
    const getTforX = (x) => {
        let aGuessT = x;
        for (let i = 0; i < 4; ++i) {
            const currentSlope = getSlope(aGuessT, p0, p2);
            if (currentSlope === 0)
                return aGuessT;
            const currentX = calcBezier(aGuessT, p0, p2) - x;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    };
    return (x) => p0 === p1 && p2 === p3 ? x : calcBezier(getTforX(x), p1, p3);
}
/**
 * Transition between values.
 *
 * @see https://vueuse.org/useTransition
 * @param source
 * @param options
 */
function useTransition(source, options = {}) {
    const { delay = 0, disabled = false, duration = 1000, onFinished = noop, onStarted = noop, transition = identity, } = options;
    // current easing function
    const currentTransition = computed(() => {
        const t = unref(transition);
        return isFunction(t) ? t : createEasingFunction(t);
    });
    // raw source value
    const sourceValue = computed(() => {
        const s = unref(source);
        return isNumber(s) ? s : s.map(unref);
    });
    // normalized source vector
    const sourceVector = computed(() => isNumber(sourceValue.value) ? [sourceValue.value] : sourceValue.value);
    // transitioned output vector
    const outputVector = ref(sourceVector.value.slice(0));
    // current transition values
    let currentDuration;
    let diffVector;
    let endAt;
    let startAt;
    let startVector;
    // transition loop
    const { resume, pause } = useRafFn(() => {
        const now = Date.now();
        const progress = clamp(1 - ((endAt - now) / currentDuration), 0, 1);
        outputVector.value = startVector.map((val, i) => { var _a; return val + (((_a = diffVector[i]) !== null && _a !== void 0 ? _a : 0) * currentTransition.value(progress)); });
        if (progress >= 1) {
            pause();
            onFinished();
        }
    }, { immediate: false });
    // start the animation loop when source vector changes
    const start = () => {
        pause();
        currentDuration = unref(duration);
        diffVector = outputVector.value.map((n, i) => { var _a, _b; return ((_a = sourceVector.value[i]) !== null && _a !== void 0 ? _a : 0) - ((_b = outputVector.value[i]) !== null && _b !== void 0 ? _b : 0); });
        startVector = outputVector.value.slice(0);
        startAt = Date.now();
        endAt = startAt + currentDuration;
        resume();
        onStarted();
    };
    const timeout = useTimeoutFn(start, delay, { immediate: false });
    watch(sourceVector, () => {
        if (unref(disabled)) {
            outputVector.value = sourceVector.value.slice(0);
        }
        else {
            if (unref(delay) <= 0)
                start();
            else
                timeout.start();
        }
    }, { deep: true });
    return computed(() => {
        const targetVector = unref(disabled) ? sourceVector : outputVector;
        return isNumber(sourceValue.value) ? targetVector.value[0] : targetVector.value;
    });
}

/**
 * Reactive URLSearchParams
 *
 * @see https://vueuse.org/useUrlSearchParams
 * @param mode
 * @param options
 */
function useUrlSearchParams(mode = 'history', options = {}) {
    const { window = defaultWindow } = options;
    if (!window)
        return reactive(Object.assign({}));
    const hashWithoutParams = computed(() => {
        const hash = window.location.hash || '';
        const index = hash.indexOf('?');
        return index > 0 ? hash.substring(0, index) : hash;
    });
    const read = () => {
        if (mode === 'hash') {
            const hash = window.location.hash || '';
            const index = hash.indexOf('?');
            return new URLSearchParams(index >= 0 ? hash.substring(index + 1) : '');
        }
        else {
            return new URLSearchParams(window.location.search || '');
        }
    };
    let params = read();
    const paramsMap = reactive(Object.assign({}));
    function writeToParamsMap(key, value) {
        return paramsMap[key] = value;
    }
    function updateParamsMap() {
        Object.keys(paramsMap).forEach(key => delete paramsMap[key]);
        for (const key of params.keys()) {
            const paramsForKey = params.getAll(key);
            writeToParamsMap(key, paramsForKey.length > 1 ? paramsForKey : (params.get(key) || ''));
        }
    }
    // Update the paramsMap with initial values
    updateParamsMap();
    const { pause, resume } = pausableWatch(paramsMap, () => {
        params = new URLSearchParams('');
        Object.keys(paramsMap).forEach((key) => {
            const mapEntry = paramsMap[key];
            if (Array.isArray(mapEntry))
                mapEntry.forEach(value => params.append(key, value));
            else
                params.set(key, mapEntry);
        });
        write(params);
    }, { deep: true });
    function write(params, shouldUpdateParamsMap) {
        pause();
        if (shouldUpdateParamsMap)
            updateParamsMap();
        const empty = !params.keys().next();
        const query = empty
            ? hashWithoutParams.value
            : (mode === 'hash')
                ? `${hashWithoutParams.value}?${params}`
                : `?${params}${hashWithoutParams.value}`;
        if (window)
            window.history.replaceState({}, '', window.location.pathname + query);
        resume();
    }
    useEventListener(window, 'popstate', () => {
        params = read();
        write(params, true);
    });
    return paramsMap;
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
/**
 * Reactive `mediaDevices.getUserMedia` streaming
 *
 * @see https://vueuse.org/useUserMedia
 * @param options
 */
function useUserMedia(options = {}) {
    var _a, _b, _c;
    const enabled = ref((_a = options.enabled) !== null && _a !== void 0 ? _a : false);
    const autoSwitch = ref((_b = options.autoSwitch) !== null && _b !== void 0 ? _b : true);
    const videoDeviceId = ref(options.videoDeviceId);
    const audioDeviceId = ref(options.audioDeviceId);
    const { navigator = defaultNavigator } = options;
    const isSupported = Boolean((_c = navigator === null || navigator === void 0 ? void 0 : navigator.mediaDevices) === null || _c === void 0 ? void 0 : _c.getUserMedia);
    const stream = shallowRef();
    function getDeviceOptions(device) {
        if (device.value === 'none' || device.value === false)
            return false;
        if (device.value == null)
            return true;
        return {
            deviceId: device.value,
        };
    }
    async function _start() {
        if (!isSupported || stream.value)
            return;
        stream.value = await navigator.mediaDevices.getUserMedia({
            video: getDeviceOptions(videoDeviceId),
            audio: getDeviceOptions(audioDeviceId),
        });
        return stream.value;
    }
    async function _stop() {
        var _a;
        (_a = stream.value) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(t => t.stop());
        stream.value = undefined;
    }
    function stop() {
        _stop();
        enabled.value = false;
    }
    async function start() {
        await _start();
        if (stream.value)
            enabled.value = true;
        return stream.value;
    }
    async function restart() {
        _stop();
        return await start();
    }
    watch(enabled, (v) => {
        if (v)
            _start();
        else
            _stop();
    }, { immediate: true });
    watch([videoDeviceId, audioDeviceId], () => {
        if (autoSwitch.value && stream.value)
            restart();
    }, { immediate: true });
    return {
        isSupported,
        stream,
        start,
        stop,
        restart,
        videoDeviceId,
        audioDeviceId,
        enabled,
        autoSwitch,
    };
}

/**
 * Shorthand for v-model binding, props + emit -> ref
 *
 * @see https://vueuse.org/useVModel
 * @param props
 * @param key (default 'value' in Vue 2 and 'modelValue' in Vue 3)
 * @param emit
 */
function useVModel(props, key, emit, options = {}) {
    var _a, _b, _c;
    const { passive = false, eventName, } = options;
    const vm = getCurrentInstance();
    // @ts-expect-error mis-alignment with @vue/composition-api
    const _emit = emit || (vm === null || vm === void 0 ? void 0 : vm.emit) || ((_a = vm === null || vm === void 0 ? void 0 : vm.$emit) === null || _a === void 0 ? void 0 : _a.bind(vm));
    let event = eventName;
    if (!key) {
        if (isVue2) {
            const modelOptions = (_c = (_b = vm === null || vm === void 0 ? void 0 : vm.proxy) === null || _b === void 0 ? void 0 : _b.$options) === null || _c === void 0 ? void 0 : _c.model;
            key = (modelOptions === null || modelOptions === void 0 ? void 0 : modelOptions.value) || 'value';
            if (!eventName)
                event = (modelOptions === null || modelOptions === void 0 ? void 0 : modelOptions.event) || 'input';
        }
        else {
            key = 'modelValue';
        }
    }
    event = eventName || event || `update:${key}`;
    if (passive) {
        const proxy = ref(props[key]);
        watch(() => props[key], v => proxy.value = v);
        watch(proxy, (v) => {
            if (v !== props[key])
                _emit(event, v);
        });
        return proxy;
    }
    else {
        return computed({
            get() {
                return props[key];
            },
            set(value) {
                _emit(event, value);
            },
        });
    }
}

/**
 * Shorthand for props v-model binding. Think like `toRefs(props)` but changes will also emit out.
 *
 * @see https://vueuse.org/useVModels
 * @param props
 * @param emit
 */
function useVModels(props, emit, options = {}) {
    const ret = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key in props)
        ret[key] = useVModel(props, key, emit, options);
    return ret;
}

function resolveNestedOptions(options) {
    if (options === true)
        return {};
    return options;
}
/**
 * Reactive WebSocket client.
 *
 * @see https://vueuse.org/useWebSocket
 * @param url
 */
function useWebSocket(url, options = {}) {
    const { onConnected, onDisconnected, onError, onMessage, immediate = true, } = options;
    const data = ref(null);
    const status = ref('CONNECTING');
    const wsRef = ref();
    let heartbeatPause;
    let heartbeatResume;
    let explicitlyClosed = false;
    let retried = 0;
    let bufferedData = [];
    const close = (code, reason) => {
        if (!wsRef.value)
            return;
        explicitlyClosed = true;
        heartbeatPause === null || heartbeatPause === void 0 ? void 0 : heartbeatPause();
        wsRef.value.close(code, reason);
    };
    const _sendBuffer = () => {
        if (bufferedData.length && wsRef.value && status.value === 'OPEN') {
            for (const buffer of bufferedData)
                wsRef.value.send(buffer);
            bufferedData = [];
        }
    };
    const send = (data, useBuffer = true) => {
        if (!wsRef.value || status.value !== 'OPEN') {
            if (useBuffer)
                bufferedData.push(data);
            return false;
        }
        _sendBuffer();
        wsRef.value.send(data);
        return true;
    };
    const _init = () => {
        const ws = new WebSocket(url);
        wsRef.value = ws;
        status.value = 'CONNECTING';
        explicitlyClosed = false;
        ws.onopen = () => {
            status.value = 'OPEN';
            onConnected === null || onConnected === void 0 ? void 0 : onConnected(ws);
            heartbeatResume === null || heartbeatResume === void 0 ? void 0 : heartbeatResume();
            _sendBuffer();
        };
        ws.onclose = (ev) => {
            status.value = 'CLOSED';
            wsRef.value = undefined;
            onDisconnected === null || onDisconnected === void 0 ? void 0 : onDisconnected(ws, ev);
            if (!explicitlyClosed && options.autoReconnect) {
                const { retries = -1, delay = 1000, onFailed, } = resolveNestedOptions(options.autoReconnect);
                retried += 1;
                if (retries < 0 || retried < retries)
                    setTimeout(_init, delay);
                else
                    onFailed === null || onFailed === void 0 ? void 0 : onFailed();
            }
        };
        ws.onerror = (e) => {
            onError === null || onError === void 0 ? void 0 : onError(ws, e);
        };
        ws.onmessage = (e) => {
            data.value = e.data;
            onMessage === null || onMessage === void 0 ? void 0 : onMessage(ws, e);
        };
    };
    if (options.heartbeat) {
        const { message = 'ping', interval = 1000, } = resolveNestedOptions(options.heartbeat);
        const { pause, resume } = useIntervalFn(() => send(message, false), interval, { immediate: false });
        heartbeatPause = pause;
        heartbeatResume = resume;
    }
    if (immediate)
        _init();
    const open = () => {
        close();
        retried = 0;
        _init();
    };
    tryOnUnmounted(close);
    return {
        data,
        status,
        close,
        send,
        open,
        ws: wsRef,
    };
}

/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */
/**
 * Simple Web Workers registration and communication.
 *
 * @see https://vueuse.org/useWebWorker
 * @param url
 * @param workerOptions
 * @param options
 */
function useWebWorker(url, workerOptions, options = {}) {
    const { window = defaultWindow, } = options;
    const data = ref(null);
    const worker = shallowRef();
    const post = function post(val) {
        if (!worker.value)
            return;
        worker.value.postMessage(val);
    };
    const terminate = function terminate() {
        if (!worker.value)
            return;
        worker.value.terminate();
    };
    if (window) {
        // @ts-expect-error untyped
        worker.value = new window.Worker(url, workerOptions);
        worker.value.onmessage = (e) => {
            data.value = e.data;
        };
        tryOnUnmounted(() => {
            if (worker.value)
                worker.value.terminate();
        });
    }
    return {
        data,
        post,
        terminate,
        worker,
    };
}

/**
 * This function accepts as a parameter a function "userFunc"
 * And as a result returns an anonymous function.
 * This anonymous function, accepts as arguments,
 * the parameters to pass to the function "useArgs" and returns a Promise
 * This function can be used as a wrapper, only inside a Worker
 * because it depends by "postMessage".
 *
 * @param {Function} userFunc {Function} fn the function to run with web worker
 *
 * @returns {Function} returns a function that accepts the parameters
 * to be passed to the "userFunc" function
 */
const jobRunner = (userFunc) => (e) => {
    const userFuncArgs = e.data[0];
    // eslint-disable-next-line prefer-spread
    return Promise.resolve(userFunc.apply(undefined, userFuncArgs))
        .then((result) => {
        // @ts-ignore
        postMessage(['SUCCESS', result]);
    })
        .catch((error) => {
        // @ts-ignore
        postMessage(['ERROR', error]);
    });
};

/**
 *
 * Concatenates the dependencies into a comma separated string.
 * this string will then be passed as an argument to the "importScripts" function
 *
 * @param {Array.<String>}} deps array of string
 * @returns {String} a string composed by the concatenation of the array
 * elements "deps" and "importScripts".
 *
 * @example
 * depsParser(['demo1', 'demo2']) // return importScripts('demo1, demo2')
 */
const depsParser = (deps) => {
    if (deps.length === 0)
        return '';
    const depsString = deps.map(dep => `${dep}`).toString();
    return `importScripts('${depsString}')`;
};

/**
 * Converts the "fn" function into the syntax needed to be executed within a web worker
 *
 * @param {Function} fn the function to run with web worker
 * @param {Array.<String>} deps array of strings, imported into the worker through "importScripts"
 *
 * @returns {String} a blob url, containing the code of "fn" as a string
 *
 * @example
 * createWorkerBlobUrl((a,b) => a+b, [])
 * // return "onmessage=return Promise.resolve((a,b) => a + b)
 * .then(postMessage(['SUCCESS', result]))
 * .catch(postMessage(['ERROR', error])"
 */
const createWorkerBlobUrl = (fn, deps) => {
    const blobCode = `${depsParser(deps)}; onmessage=(${jobRunner})(${fn})`;
    const blob = new Blob([blobCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    return url;
};

/* this implementation is a vue port of https://github.com/alewin/useWorker by Alessio Koci */
/**
 * Run expensive function without blocking the UI, using a simple syntax that makes use of Promise.
 *
 * @see https://vueuse.org/useWebWorkerFn
 * @param fn
 * @param options
 */
const useWebWorkerFn = (fn, options = {}) => {
    const { dependencies = [], timeout, window = defaultWindow, } = options;
    const worker = ref();
    const workerStatus = ref('PENDING');
    const promise = ref({});
    const timeoutId = ref();
    const workerTerminate = (status = 'PENDING') => {
        if (worker.value && worker.value._url && window) {
            worker.value.terminate();
            URL.revokeObjectURL(worker.value._url);
            promise.value = {};
            worker.value = undefined;
            window.clearTimeout(timeoutId.value);
            workerStatus.value = status;
        }
    };
    workerTerminate();
    tryOnUnmounted(workerTerminate);
    const generateWorker = () => {
        const blobUrl = createWorkerBlobUrl(fn, dependencies);
        const newWorker = new Worker(blobUrl);
        newWorker._url = blobUrl;
        newWorker.onmessage = (e) => {
            const { resolve = () => { }, reject = () => { } } = promise.value;
            const [status, result] = e.data;
            switch (status) {
                case 'SUCCESS':
                    resolve(result);
                    workerTerminate(status);
                    break;
                default:
                    reject(result);
                    workerTerminate('ERROR');
                    break;
            }
        };
        newWorker.onerror = (e) => {
            const { reject = () => { } } = promise.value;
            reject(e);
            workerTerminate('ERROR');
        };
        if (timeout) {
            timeoutId.value = setTimeout(() => workerTerminate('TIMEOUT_EXPIRED'), timeout);
        }
        return newWorker;
    };
    const callWorker = (...fnArgs) => new Promise((resolve, reject) => {
        promise.value = {
            resolve,
            reject,
        };
        worker.value && worker.value.postMessage([[...fnArgs]]);
        workerStatus.value = 'RUNNING';
    });
    const workerFn = (...fnArgs) => {
        if (workerStatus.value === 'RUNNING') {
            /* eslint-disable-next-line no-console */
            console.error('[useWebWorkerFn] You can only run one instance of the worker at a time.');
            /* eslint-disable-next-line prefer-promise-reject-errors */
            return Promise.reject();
        }
        worker.value = generateWorker();
        return callWorker(...fnArgs);
    };
    return {
        workerFn,
        workerStatus,
        workerTerminate,
    };
};

/**
 * Reactive window scroll.
 *
 * @see https://vueuse.org/useWindowScroll
 * @param options
 */
function useWindowScroll({ window = defaultWindow } = {}) {
    if (!window) {
        return {
            x: ref(0),
            y: ref(0),
        };
    }
    const x = ref(window.pageXOffset);
    const y = ref(window.pageYOffset);
    useEventListener('scroll', () => {
        x.value = window.pageXOffset;
        y.value = window.pageYOffset;
    }, {
        capture: false,
        passive: true,
    });
    return { x, y };
}

/**
 * Reactive window size.
 *
 * @see https://vueuse.org/useWindowSize
 * @param options
 */
function useWindowSize({ window = defaultWindow, initialWidth = Infinity, initialHeight = Infinity } = {}) {
    if (!window) {
        return {
            width: ref(initialWidth),
            height: ref(initialHeight),
        };
    }
    const width = ref(window.innerWidth);
    const height = ref(window.innerHeight);
    useEventListener('resize', () => {
        width.value = window.innerWidth;
        height.value = window.innerHeight;
    }, { passive: true });
    return { width, height };
}

export { DefaultMagicKeysAliasMap, SwipeDirection, TransitionPresets, asyncComputed, autoResetRef, breakpointsAntDesign, breakpointsBootstrapV5, breakpointsSematic, breakpointsTailwind, breakpointsVuetify, createFetch, createGlobalState, onClickOutside, onKeyDown, onKeyPressed, onKeyStroke, onKeyUp, onStartTyping, templateRef, toRefs, unrefElement, useActiveElement, useAsyncState, useBattery, useBreakpoints, useBrowserLocation, useClipboard, useCssVar, useDark, useDeviceMotion, useDeviceOrientation, useDevicePixelRatio, useDevicesList, useDocumentVisibility, useElementBounding, useElementSize, useElementVisibility, useEventListener, useEventSource, useFavicon, useFetch, useFullscreen, useGeolocation, useIdle, useIntersectionObserver, useLocalStorage, useMagicKeys, useManualRefHistory, useMediaControls, useMediaQuery, useMouse, useMouseInElement, useMousePressed, useMutationObserver, useNetwork, useNow, useOnline, usePageLeave, useParallax, usePermission, usePointerSwipe, usePreferredColorScheme, usePreferredDark, usePreferredLanguages, useRafFn, useRefHistory, useResizeObserver, useScriptTag, useSessionStorage, useShare, useSpeechRecognition, useStorage, useSwipe, useTimeAgo, useTimestamp, useTitle, useTransition, useUrlSearchParams, useUserMedia, useVModel, useVModels, useWebSocket, useWebWorker, useWebWorkerFn, useWindowScroll, useWindowSize };
