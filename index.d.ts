import * as _vueuse_shared from '@vueuse/shared';
import { Fn, MaybeRef, ConfigurableEventFilter, ConfigurableFlush, EventHookOn, Pausable } from '@vueuse/shared';
export * from '@vueuse/shared';
import * as vue_demi from 'vue-demi';
import { Ref, defineComponent, ToRefs, ComputedRef } from 'vue-demi';
import * as vue from 'vue';

/**
 * Handle overlapping async evaluations.
 *
 * @param cancelCallback The provided callback is invoked when a re-evaluation of the computed value is triggered before the previous one finished
 */
declare type AsyncComputedOnCancel = (cancelCallback: Fn) => void;
/**
 * Additional options for asyncComputed
 *
 * @property lazy         Should value be evaluated lazily
 * @property evaluating   Ref passed to receive the updated of async evaluation
 */
declare type AsyncComputedOptions = {
    lazy?: Boolean;
    evaluating?: Ref<boolean>;
};
/**
 * Create an asynchronous computed dependency.
 *
 * @see https://vueuse.org/asyncComputed
 * @param evaluationCallback     The promise-returning callback which generates the computed value
 * @param initialState           The initial state, used until the first evaluation finishes
 * @param optionsOrRef           Additional options or a ref passed to receive the updates of the async evaluation
 */
declare function asyncComputed<T>(evaluationCallback: (onCancel: AsyncComputedOnCancel) => T | Promise<T>, initialState?: T, optionsOrRef?: Ref<boolean> | AsyncComputedOptions): Ref<T>;

/**
 * Create a ref which will be reset to the default value after some time.
 *
 * @see https://vueuse.org/autoResetRef
 * @param defaultValue The value which will be set.
 * @param afterMs      A zero-or-greater delay in milliseconds.
 */
declare function autoResetRef<T>(defaultValue: T, afterMs?: MaybeRef<number>): Ref<T>;

/**
 * Keep states in the global scope to be reusable across Vue instances.
 *
 * @see https://vueuse.org/createGlobalState
 * @param stateFactory A factory function to create the state
 */
declare function createGlobalState<T extends object>(stateFactory: () => T): () => T;
declare type CreateGlobalStateReturn = ReturnType<typeof createGlobalState>;

declare type VueInstance = InstanceType<ReturnType<typeof defineComponent>>;
declare type MaybeElementRef = MaybeRef<Element | VueInstance | undefined | null>;
/**
 * Get the dom element of a ref of element or Vue component instance
 *
 * @param elRef
 */
declare function unrefElement(elRef: MaybeElementRef): any;

interface ConfigurableWindow {
    window?: Window;
}
interface ConfigurableDocument {
    document?: Document;
}
interface ConfigurableNavigator {
    navigator?: Navigator;
}

declare type OnClickOutsideEvents = Pick<WindowEventMap, 'mousedown' | 'mouseup' | 'touchstart' | 'touchend' | 'pointerdown' | 'pointerup'>;
interface OnClickOutsideOptions<E extends keyof OnClickOutsideEvents> extends ConfigurableWindow {
    event?: E;
}
/**
 * Listen for clicks outside of an element.
 *
 * @see https://vueuse.org/onClickOutside
 * @param target
 * @param handler
 * @param options
 */
declare function onClickOutside<E extends keyof OnClickOutsideEvents = 'pointerdown'>(target: MaybeElementRef, handler: (evt: OnClickOutsideEvents[E]) => void, options?: OnClickOutsideOptions<E>): Fn | undefined;

declare type KeyPredicate = (event: KeyboardEvent) => boolean;
declare type KeyFilter = null | undefined | string | KeyPredicate;
declare type KeyStrokeEventName = 'keydown' | 'keypress' | 'keyup';
declare type KeyStrokeOptions = {
    eventName?: KeyStrokeEventName;
    target?: MaybeRef<EventTarget>;
    passive?: boolean;
};
/**
 * Listen for keyboard keys being stroked.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
declare function onKeyStroke(key: KeyFilter, handler: (event: KeyboardEvent) => void, options?: KeyStrokeOptions): _vueuse_shared.Fn;
/**
 * Listen to the keydown event of the given key.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
declare function onKeyDown(key: KeyFilter, handler: (event: KeyboardEvent) => void, options?: Omit<KeyStrokeOptions, 'eventName'>): _vueuse_shared.Fn;
/**
 * Listen to the keypress event of the given key.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
declare function onKeyPressed(key: KeyFilter, handler: (event: KeyboardEvent) => void, options?: Omit<KeyStrokeOptions, 'eventName'>): _vueuse_shared.Fn;
/**
 * Listen to the keyup event of the given key.
 *
 * @see https://vueuse.org/onKeyStroke
 * @param key
 * @param handler
 * @param options
 */
declare function onKeyUp(key: KeyFilter, handler: (event: KeyboardEvent) => void, options?: Omit<KeyStrokeOptions, 'eventName'>): _vueuse_shared.Fn;

/**
 * Fires when users start typing on non-editable elements.
 *
 * @see https://vueuse.org/onStartTyping
 * @param callback
 * @param options
 */
declare function onStartTyping(callback: (event: KeyboardEvent) => void, options?: ConfigurableDocument): void;

/**
 * Shorthand for binding ref to template element.
 *
 * @see https://vueuse.org/templateRef
 * @param key
 * @param initialValue
 */
declare function templateRef<T extends Element | null>(key: string, initialValue?: T | null): Readonly<Ref<T>>;

/**
 * Extended `toRefs` that also accepts refs of an object.
 *
 * @see https://vueuse.org/toRefs
 * @param objectRef A ref or normal object or array.
 */
declare function toRefs<T extends object>(objectRef: MaybeRef<T>): ToRefs<T>;

/**
 * Reactive `document.activeElement`
 *
 * @see https://vueuse.org/useActiveElement
 * @param options
 */
declare function useActiveElement<T extends HTMLElement>(options?: ConfigurableWindow): vue_demi.ComputedRef<T | null | undefined>;

interface AsyncStateOptions {
    /**
     * Delay for executing the promise. In milliseconds.
     *
     * @default 0
     */
    delay?: number;
    /**
     * Excute the promise right after the function is invoked.
     * Will apply the delay if any.
     *
     * When set to false, you will need to execute it manually.
     *
     * @default true
     */
    immediate?: boolean;
    /**
     * Callback when error is caught.
     */
    onError?: (e: Error) => void;
    /**
     * Sets the state to initialState before executing the promise.
     *
     * This can be useful when calling the execute function more than once (for
     * example, to refresh data). When set to false, the current state remains
     * unchanged until the promise resolves.
     *
     * @default true
     */
    resetOnExecute?: boolean;
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
declare function useAsyncState<T>(promise: Promise<T> | (() => Promise<T>), initialState: T, options?: AsyncStateOptions): {
    state: vue_demi.Ref<T>;
    isReady: vue_demi.Ref<boolean>;
    error: vue_demi.Ref<{
        name: string;
        message: string;
        stack?: string | undefined;
    } | undefined>;
    execute: (delay?: number) => Promise<void>;
};
declare type UseAsyncStateReturn = ReturnType<typeof useAsyncState>;

interface BatteryManager extends EventTarget {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
}
/**
 * Reactive Battery Status API.
 *
 * @see https://vueuse.org/useBattery
 * @param options
 */
declare function useBattery({ navigator }?: ConfigurableNavigator): {
    isSupported: boolean | undefined;
    charging: vue_demi.Ref<boolean>;
    chargingTime: vue_demi.Ref<number>;
    dischargingTime: vue_demi.Ref<number>;
    level: vue_demi.Ref<number>;
};
declare type UseBatteryReturn = ReturnType<typeof useBattery>;

/**
 * Breakpoints from Tailwind V2
 *
 * @see https://tailwindcss.com/docs/breakpoints
 */
declare const breakpointsTailwind: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
};
/**
 * Breakpoints from Bootstrap V5
 *
 * @see https://getbootstrap.com/docs/5.0/layout/breakpoints
 */
declare const breakpointsBootstrapV5: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
};
/**
 * Breakpoints from Vuetify V2
 *
 * @see https://vuetifyjs.com/en/features/breakpoints
 */
declare const breakpointsVuetify: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
};
/**
 * Breakpoints from Ant Design
 *
 * @see https://ant.design/components/layout/#breakpoint-width
 */
declare const breakpointsAntDesign: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
};
/**
 * Sematic Breakpoints
 */
declare const breakpointsSematic: {
    mobileS: number;
    mobileM: number;
    mobileL: number;
    tablet: number;
    laptop: number;
    laptopL: number;
    desktop4K: number;
};

declare type Breakpoints<K extends string = string> = Record<K, number | string>;
/**
 * Reactively viewport breakpoints
 *
 * @see https://vueuse.org/useBreakpoints
 * @param options
 */
declare function useBreakpoints<K extends string>(breakpoints: Breakpoints<K>, options?: ConfigurableWindow): {
    greater(k: K): vue.Ref<boolean>;
    smaller(k: K): vue.Ref<boolean>;
    between(a: K, b: K): vue.Ref<boolean>;
    isGreater(k: K): boolean;
    isSmaller(k: K): boolean;
    isInBetween(a: K, b: K): boolean;
};
declare type UseBreakpointsReturn = ReturnType<typeof useBreakpoints>;

interface BrowserLocationState {
    trigger: string;
    state?: any;
    length?: number;
    hash?: string;
    host?: string;
    hostname?: string;
    href?: string;
    origin?: string;
    pathname?: string;
    port?: string;
    protocol?: string;
    search?: string;
}
/**
 * Reactive browser location.
 *
 * @see https://vueuse.org/useBrowserLocation
 * @param options
 */
declare function useBrowserLocation({ window }?: ConfigurableWindow): vue_demi.Ref<{
    trigger: string;
    state?: any;
    length?: number | undefined;
    hash?: string | undefined;
    host?: string | undefined;
    hostname?: string | undefined;
    href?: string | undefined;
    origin?: string | undefined;
    pathname?: string | undefined;
    port?: string | undefined;
    protocol?: string | undefined;
    search?: string | undefined;
}>;
declare type UseBrowserLocationReturn = ReturnType<typeof useBrowserLocation>;

interface ClipboardOptions<Source> extends ConfigurableNavigator {
    /**
     * Enabled reading for clipboard
     *
     * @default true
     */
    read?: boolean;
    /**
     * Copy source
     */
    source?: Source;
    /**
     * Milliseconds to reset state of `copied` ref
     *
     * @default 1500
     */
    copiedDuring?: number;
}
interface ClipboardReturn<Optional> {
    isSupported: boolean;
    text: ComputedRef<string>;
    copied: ComputedRef<boolean>;
    copy: Optional extends true ? (text?: string) => Promise<void> : (text: string) => Promise<void>;
}
/**
 * Reactive Clipboard API.
 *
 * @see https://vueuse.org/useClipboard
 * @param options
 */
declare function useClipboard(options?: ClipboardOptions<undefined>): ClipboardReturn<false>;
declare function useClipboard(options: ClipboardOptions<MaybeRef<string>>): ClipboardReturn<true>;

/**
 * Manipulate CSS variables.
 *
 * @see https://vueuse.org/useCssVar
 * @param prop
 * @param el
 * @param options
 */
declare function useCssVar(prop: string, target?: MaybeElementRef, { window }?: ConfigurableWindow): vue_demi.Ref<string>;

declare type Serializer<T> = {
    read(raw: string): T;
    write(value: T): string;
};
declare type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
interface StorageOptions<T> extends ConfigurableEventFilter, ConfigurableWindow, ConfigurableFlush {
    /**
     * Watch for deep changes
     *
     * @default true
     */
    deep?: boolean;
    /**
     * Listen to storage changes, useful for multiple tabs application
     *
     * @default true
     */
    listenToStorageChanges?: boolean;
    /**
     * Custom data serialization
     */
    serializer?: Serializer<T>;
}
declare function useStorage(key: string, defaultValue: string, storage?: StorageLike, options?: StorageOptions<string>): Ref<string>;
declare function useStorage(key: string, defaultValue: boolean, storage?: StorageLike, options?: StorageOptions<boolean>): Ref<boolean>;
declare function useStorage(key: string, defaultValue: number, storage?: StorageLike, options?: StorageOptions<number>): Ref<number>;
declare function useStorage<T>(key: string, defaultValue: T, storage?: StorageLike, options?: StorageOptions<T>): Ref<T>;
declare function useStorage<T = unknown>(key: string, defaultValue: null, storage?: StorageLike, options?: StorageOptions<T>): Ref<T>;

declare type ColorSchemes = 'light' | 'dark' | 'auto';
interface UseDarkOptions extends StorageOptions<ColorSchemes> {
    /**
     * CSS Selector for the target element applying to
     *
     * @default 'html'
     */
    selector?: string;
    /**
     * HTML attribute applying the target element
     *
     * @default 'class'
     */
    attribute?: string;
    /**
     * Value applying to the target element when isDark=true
     *
     * @default 'dark'
     */
    valueDark?: string;
    /**
     * Value applying to the target element when isDark=false
     *
     * @default ''
     */
    valueLight?: string;
    /**
     * A custom handler for handle the updates.
     * When specified, the default behavior will be overridded.
     *
     * @default undefined
     */
    onChanged?: (isDark: boolean) => void;
    /**
     * Key to persist the data into localStorage/sessionStorage.
     *
     * Pass `null` to disable persistence
     *
     * @default 'vueuse-color-scheme'
     */
    storageKey?: string | null;
    /**
     * Storage object, can be localStorage or sessionStorage
     *
     * @default localStorage
     */
    storage?: StorageLike;
}
/**
 * Reactive dark mode with auto data persistence.
 *
 * @see https://vueuse.org/useDark
 * @param options
 */
declare function useDark(options?: UseDarkOptions): vue_demi.WritableComputedRef<boolean>;

interface DeviceMotionOptions extends ConfigurableWindow, ConfigurableEventFilter {
}
/**
 * Reactive DeviceMotionEvent.
 *
 * @see https://vueuse.org/useDeviceMotion
 * @param options
 */
declare function useDeviceMotion(options?: DeviceMotionOptions): {
    acceleration: Ref<DeviceMotionEventAcceleration | null>;
    accelerationIncludingGravity: Ref<DeviceMotionEventAcceleration | null>;
    rotationRate: Ref<DeviceMotionEventRotationRate | null>;
    interval: Ref<number>;
};
declare type UseDeviceMotionReturn = ReturnType<typeof useDeviceMotion>;

/**
 * Reactive DeviceOrientationEvent.
 *
 * @see https://vueuse.org/useDeviceOrientation
 * @param options
 */
declare function useDeviceOrientation(options?: ConfigurableWindow): {
    isSupported: boolean;
    isAbsolute: Ref<boolean>;
    alpha: Ref<number | null>;
    beta: Ref<number | null>;
    gamma: Ref<number | null>;
};
declare type UseDeviceOrientationReturn = ReturnType<typeof useDeviceOrientation>;

/**
 * Reactively track `window.devicePixelRatio`.
 *
 * @see https://vueuse.org/useDevicePixelRatio
 * @param options
 */
declare function useDevicePixelRatio({ window, }?: ConfigurableWindow): {
    pixelRatio: vue_demi.Ref<number>;
};
declare type UseDevicePixelRatioReturn = ReturnType<typeof useDevicePixelRatio>;

interface UseDevicesListOptions extends ConfigurableNavigator {
    onUpdated?: (devices: MediaDeviceInfo[]) => void;
    /**
     * Request for permissions immediately if it's not granted,
     * otherwise label and deviceIds could be empty
     *
     * @default false
     */
    requestPermissions?: boolean;
}
interface UseDevicesListReturn {
    /**
     * All devices
     */
    devices: Ref<MediaDeviceInfo[]>;
    videoInputs: ComputedRef<MediaDeviceInfo[]>;
    audioInputs: ComputedRef<MediaDeviceInfo[]>;
    audioOutputs: ComputedRef<MediaDeviceInfo[]>;
    permissionGranted: Ref<boolean>;
    ensurePermissions: () => Promise<boolean>;
    isSupported: boolean;
}
/**
 * Reactive `enumerateDevices` listing avaliable input/output devices
 *
 * @see https://vueuse.org/useDevicesList
 * @param options
 */
declare function useDevicesList(options?: UseDevicesListOptions): UseDevicesListReturn;

/**
 * Reactively track `document.visibilityState`.
 *
 * @see https://vueuse.org/useDocumentVisibility
 * @param options
 */
declare function useDocumentVisibility({ document }?: ConfigurableDocument): Ref<VisibilityState>;

interface ResizeObserverSize {
    readonly inlineSize: number;
    readonly blockSize: number;
}
interface ResizeObserverEntry {
    readonly target: Element;
    readonly contentRect: DOMRectReadOnly;
    readonly borderBoxSize?: ReadonlyArray<ResizeObserverSize>;
    readonly contentBoxSize?: ReadonlyArray<ResizeObserverSize>;
    readonly devicePixelContentBoxSize?: ReadonlyArray<ResizeObserverSize>;
}
declare type ResizeObserverCallback = (entries: ReadonlyArray<ResizeObserverEntry>, observer: ResizeObserver) => void;
interface ResizeObserverOptions extends ConfigurableWindow {
    /**
     * Sets which box model the observer will observe changes to. Possible values
     * are `content-box` (the default), and `border-box`.
     *
     * @default 'content-box'
     */
    box?: 'content-box' | 'border-box';
}
declare class ResizeObserver {
    constructor(callback: ResizeObserverCallback);
    disconnect(): void;
    observe(target: Element, options?: ResizeObserverOptions): void;
    unobserve(target: Element): void;
}
/**
 * Reports changes to the dimensions of an Element's content or the border-box
 *
 * @see https://vueuse.org/useResizeObserver
 * @param target
 * @param callback
 * @param options
 */
declare function useResizeObserver(target: MaybeElementRef, callback: ResizeObserverCallback, options?: ResizeObserverOptions): {
    isSupported: boolean | undefined;
    stop: () => void;
};
declare type UseResizeObserverReturn = ReturnType<typeof useResizeObserver>;

/**
 * Reactive size of an HTML element.
 *
 * @see https://vueuse.org/useElementSize
 * @param target
 * @param callback
 * @param options
 */
declare function useElementBounding(target: MaybeElementRef, options?: ResizeObserverOptions): {
    x: vue_demi.Ref<number>;
    y: vue_demi.Ref<number>;
    top: vue_demi.Ref<number>;
    right: vue_demi.Ref<number>;
    bottom: vue_demi.Ref<number>;
    left: vue_demi.Ref<number>;
    width: vue_demi.Ref<number>;
    height: vue_demi.Ref<number>;
};
declare type UseElementBoundingReturn = ReturnType<typeof useElementBounding>;

interface ElementSize {
    width: number;
    height: number;
}
/**
 * Reactive size of an HTML element.
 *
 * @see https://vueuse.org/useElementSize
 * @param target
 * @param callback
 * @param options
 */
declare function useElementSize(target: MaybeElementRef, initialSize?: ElementSize, options?: ResizeObserverOptions): {
    width: vue_demi.Ref<number>;
    height: vue_demi.Ref<number>;
};
declare type UseElementSizeReturn = ReturnType<typeof useElementSize>;

interface VisibilityScrollTargetOptions extends ConfigurableWindow {
    scrollTarget?: Ref<Element | null | undefined>;
}
/**
 * Tracks the visibility of an element within the viewport.
 *
 * @see https://vueuse.org/useElementVisibility
 * @param element
 * @param options
 */
declare function useElementVisibility(element: Ref<Element | null | undefined>, { window, scrollTarget }?: VisibilityScrollTargetOptions): Ref<boolean>;

interface InferEventTarget<Events> {
    addEventListener(event: Events, fn?: any, options?: any): any;
    removeEventListener(event: Events, fn?: any, options?: any): any;
}
declare type WindowEventName = keyof WindowEventMap;
declare type DocumentEventName = keyof DocumentEventMap;
declare type GeneralEventListener<E = Event> = {
    (evt: E): void;
};
/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 1: Omitted Window target
 *
 * @see https://vueuse.org/useEventListener
 * @param event
 * @param listener
 * @param options
 */
declare function useEventListener<E extends keyof WindowEventMap>(event: E, listener: (this: Window, ev: WindowEventMap[E]) => any, options?: boolean | AddEventListenerOptions): Fn;
/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 2: Explicitly Window target
 *
 * @see https://vueuse.org/useEventListener
 * @param target
 * @param event
 * @param listener
 * @param options
 */
declare function useEventListener<E extends keyof WindowEventMap>(target: Window, event: E, listener: (this: Window, ev: WindowEventMap[E]) => any, options?: boolean | AddEventListenerOptions): Fn;
/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 3: Explicitly Document target
 *
 * @see https://vueuse.org/useEventListener
 * @param target
 * @param event
 * @param listener
 * @param options
 */
declare function useEventListener<E extends keyof DocumentEventMap>(target: Document, event: E, listener: (this: Document, ev: DocumentEventMap[E]) => any, options?: boolean | AddEventListenerOptions): Fn;
/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 4: Custom event target with event type infer
 *
 * @see https://vueuse.org/useEventListener
 * @param target
 * @param event
 * @param listener
 * @param options
 */
declare function useEventListener<Names extends string, EventType = Event>(target: InferEventTarget<Names>, event: Names, listener: GeneralEventListener<EventType>, options?: boolean | AddEventListenerOptions): Fn;
/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 5: Custom event target fallback
 *
 * @see https://vueuse.org/useEventListener
 * @param target
 * @param event
 * @param listener
 * @param options
 */
declare function useEventListener<EventType = Event>(target: MaybeRef<EventTarget | null | undefined>, event: string, listener: GeneralEventListener<EventType>, options?: boolean | AddEventListenerOptions): Fn;

/**
 * Reactive wrapper for EventSource.
 *
 * @see https://vueuse.org/useEventSource
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventSource/EventSource EventSource
 * @param url
 * @param events
 */
declare function useEventSource(url: string, events?: Array<string>): {
    eventSource: Ref<EventSource | null>;
    event: Ref<string | null>;
    data: Ref<string | null>;
    status: Ref<"OPEN" | "CONNECTING" | "CLOSED">;
    error: Ref<Event | null>;
    close: () => void;
};
declare type UseEventListenerReturn = ReturnType<typeof useEventListener>;

interface FaviconOptions extends ConfigurableDocument {
    baseUrl?: string;
    rel?: string;
}
/**
 * Reactive favicon.
 *
 * @see https://vueuse.org/useFavicon
 * @param newIcon
 * @param options
 */
declare function useFavicon(newIcon?: MaybeRef<string | null | undefined>, options?: FaviconOptions): vue_demi.Ref<string | null | undefined>;

interface UseFetchReturnBase<T> {
    /**
     * Indicates if the fetch request has finished
     */
    isFinished: Ref<boolean>;
    /**
     * The statusCode of the HTTP fetch response
     */
    statusCode: Ref<number | null>;
    /**
     * The raw response of the fetch response
     */
    response: Ref<Response | null>;
    /**
     * Any fetch errors that may have occurred
     */
    error: Ref<any>;
    /**
     * The fetch response body, may either be JSON or text
     */
    data: Ref<T | null>;
    /**
     * Indicates if the request is currently being fetched.
     */
    isFetching: Ref<boolean>;
    /**
     * Indicates if the fetch request is able to be aborted
     */
    canAbort: ComputedRef<boolean>;
    /**
     * Indicates if the fetch request was aborted
     */
    aborted: Ref<boolean>;
    /**
     * Abort the fetch request
     */
    abort: Fn;
    /**
     * Manually call the fetch
     */
    execute: () => Promise<any>;
    /**
     * Fires after the fetch request has finished
     */
    onFetchResponse: EventHookOn<Response>;
    /**
     * Fires after a fetch request error
     */
    onFetchError: EventHookOn;
}
interface UseFetchReturnTypeConfigured<T> extends UseFetchReturnBase<T> {
    get(): UseFetchReturnBase<T>;
    post(payload?: unknown, type?: string): UseFetchReturnBase<T>;
    put(payload?: unknown, type?: string): UseFetchReturnBase<T>;
    delete(payload?: unknown, type?: string): UseFetchReturnBase<T>;
}
interface UseFetchReturn<T> extends UseFetchReturnTypeConfigured<T> {
    json<JSON = any>(): UseFetchReturnTypeConfigured<JSON>;
    text(): UseFetchReturnTypeConfigured<string>;
    blob(): UseFetchReturnTypeConfigured<Blob>;
    arrayBuffer(): UseFetchReturnTypeConfigured<ArrayBuffer>;
    formData(): UseFetchReturnTypeConfigured<FormData>;
}
interface BeforeFetchContext {
    /**
     * The computed url of the current request
     */
    url: string;
    /**
     * The request options of the current request
     */
    options: RequestInit;
    /**
     * Cancels the current request
     */
    cancel: Fn;
}
interface AfterFetchContext<T = any> {
    response: Response;
    data: T | null;
}
interface UseFetchOptions {
    /**
     * Fetch function
     */
    fetch?: typeof window.fetch;
    /**
     * Will automatically run fetch when `useFetch` is used
     *
     * @default true
     */
    immediate?: boolean;
    /**
     * Will automatically refetch when the URL is changed if the url is a ref
     *
     * @default false
     */
    refetch?: MaybeRef<boolean>;
    /**
     * Will run immediately before the fetch request is dispatched
     */
    beforeFetch?: (ctx: BeforeFetchContext) => Promise<Partial<BeforeFetchContext> | void> | Partial<BeforeFetchContext> | void;
    /**
     * Will run immediately after the fetch request is returned.
     * Runs after any 2xx response
     */
    afterFetch?: (ctx: AfterFetchContext) => Promise<Partial<AfterFetchContext>> | Partial<AfterFetchContext>;
}
interface CreateFetchOptions {
    /**
     * The base URL that will be prefixed to all urls
     */
    baseUrl?: MaybeRef<string>;
    /**
     * Default Options for the useFetch function
     */
    options?: UseFetchOptions;
    /**
     * Options for the fetch request
     */
    fetchOptions?: RequestInit;
}
declare function createFetch(config?: CreateFetchOptions): typeof useFetch;
declare function useFetch<T>(url: MaybeRef<string>): UseFetchReturn<T>;
declare function useFetch<T>(url: MaybeRef<string>, useFetchOptions: UseFetchOptions): UseFetchReturn<T>;
declare function useFetch<T>(url: MaybeRef<string>, options: RequestInit, useFetchOptions?: UseFetchOptions): UseFetchReturn<T>;

/**
 * Reactive Fullscreen API.
 *
 * @see https://vueuse.org/useFullscreen
 * @param target
 * @param options
 */
declare function useFullscreen(target?: MaybeElementRef, options?: ConfigurableDocument): {
    isSupported: boolean;
    isFullscreen: vue_demi.Ref<boolean>;
    enter: () => Promise<void>;
    exit: () => Promise<void>;
    toggle: () => Promise<void>;
};
declare type UseFullscreenReturn = ReturnType<typeof useFullscreen>;

interface GeolocationOptions extends Partial<PositionOptions>, ConfigurableNavigator {
}
/**
 * Reactive Geolocation API.
 *
 * @see https://vueuse.org/useGeolocation
 * @param options
 */
declare function useGeolocation(options?: GeolocationOptions): {
    isSupported: boolean | undefined;
    coords: Ref<GeolocationCoordinates>;
    locatedAt: Ref<number | null>;
    error: Ref<{
        readonly code: number;
        readonly message: string;
        readonly PERMISSION_DENIED: number;
        readonly POSITION_UNAVAILABLE: number;
        readonly TIMEOUT: number;
    } | null>;
};
declare type UseGeolocationReturn = ReturnType<typeof useGeolocation>;

interface IdleOptions extends ConfigurableWindow, ConfigurableEventFilter {
    /**
     * Event names that listen to for detected user activity
     *
     * @default ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel']
     */
    events?: WindowEventName[];
    /**
     * Listen for document visibility change
     *
     * @default true
     */
    listenForVisibilityChange?: boolean;
    /**
     * Initial state of the ref idle
     *
     * @default false
     */
    initialState?: boolean;
}
interface UseIdleReturn {
    idle: Ref<boolean>;
    lastActive: Ref<number>;
}
/**
 * Tracks whether the user is being inactive.
 *
 * @see https://vueuse.org/useIdle
 * @param timeout default to 1 minute
 * @param options IdleOptions
 */
declare function useIdle(timeout?: number, options?: IdleOptions): UseIdleReturn;

interface IntersectionObserverOptions extends ConfigurableWindow {
    /**
     * The Element or Document whose bounds are used as the bounding box when testing for intersection.
     */
    root?: MaybeElementRef;
    /**
     * A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections.
     */
    rootMargin?: string;
    /**
     * Either a single number or an array of numbers between 0.0 and 1.
     */
    threshold?: number | number[];
}
/**
 * Detects that a target element's visibility.
 *
 * @see https://vueuse.org/useIntersectionObserver
 * @param target
 * @param callback
 * @param options
 */
declare function useIntersectionObserver(target: MaybeElementRef, callback: IntersectionObserverCallback, options?: IntersectionObserverOptions): {
    isSupported: boolean | undefined;
    stop: () => void;
};
declare type UseIntersectionObserverReturn = ReturnType<typeof useIntersectionObserver>;

declare function useLocalStorage(key: string, defaultValue: string, options?: StorageOptions<string>): Ref<string>;
declare function useLocalStorage(key: string, defaultValue: boolean, options?: StorageOptions<boolean>): Ref<boolean>;
declare function useLocalStorage(key: string, defaultValue: number, options?: StorageOptions<number>): Ref<number>;
declare function useLocalStorage<T>(key: string, defaultValue: T, options?: StorageOptions<T>): Ref<T>;
declare function useLocalStorage<T = unknown>(key: string, defaultValue: null, options?: StorageOptions<T>): Ref<T>;

declare const DefaultMagicKeysAliasMap: Readonly<Record<string, string>>;

interface UseMagicKeysOptions<Reactive extends Boolean> {
    /**
     * Returns a reactive object instead of an object of refs
     *
     * @default false
     */
    reactive?: Reactive;
    /**
     * Target for listening events
     *
     * @default window
     */
    target?: MaybeRef<EventTarget>;
    /**
     * Alias map for keys, all the keys should be lowercase
     * { target: keycode }
     *
     * @example { ctrl: "control" }
     * @default <predefined-map>
     */
    aliasMap?: Record<string, string>;
    /**
     * Register passive listener
     *
     * @default true
     */
    passive?: boolean;
    /**
     * Custom event handler for keydown/keyup event.
     * Useful when you want to apply custom logic.
     *
     * When using `e.preventDefault()`, you will need to pass `passive: false` to useMagicKeys().
     */
    onEventFired?: (e: KeyboardEvent) => void | boolean;
}
interface MagicKeysInternal {
    /**
     * A Set of currently pressed keys,
     * Stores raw keyCodes.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
     */
    current: Set<string>;
}
declare type MagicKeys<Reactive extends Boolean> = Readonly<Omit<Reactive extends true ? Record<string, boolean> : Record<string, ComputedRef<boolean>>, keyof MagicKeysInternal> & MagicKeysInternal>;
/**
 * Reactive keys pressed state, with magical keys combination support.
 *
 * @see https://vueuse.org/useMagicKeys
 */
declare function useMagicKeys(options?: UseMagicKeysOptions<false>): MagicKeys<false>;
declare function useMagicKeys(options: UseMagicKeysOptions<true>): MagicKeys<true>;

interface UseRefHistoryRecord<T> {
    snapshot: T;
    timestamp: number;
}
declare type CloneFn<F, T = F> = (x: F) => T;
interface UseManualRefHistoryOptions<Raw, Serialized = Raw> {
    /**
     * Maximum number of history to be kept. Default to unlimited.
     */
    capacity?: number;
    /**
     * Clone when taking a snapshot, shortcut for dump: JSON.parse(JSON.stringify(value)).
     * Default to false
     *
     * @default false
     */
    clone?: boolean | CloneFn<Raw>;
    /**
     * Serialize data into the history
     */
    dump?: (v: Raw) => Serialized;
    /**
     * Deserialize data from the history
     */
    parse?: (v: Serialized) => Raw;
    /**
     * Deserialize data from the history
     */
    setSource?: (source: Ref<Raw>, v: Raw) => void;
}
interface UseManualRefHistoryReturn<Raw, Serialized> {
    /**
     * Bypassed tracking ref from the argument
     */
    source: Ref<Raw>;
    /**
     * An array of history records for undo, newest comes to first
     */
    history: Ref<UseRefHistoryRecord<Serialized>[]>;
    /**
    * Last history point, source can be different if paused
    */
    last: Ref<UseRefHistoryRecord<Serialized>>;
    /**
     * Same as 'history'
     */
    undoStack: Ref<UseRefHistoryRecord<Serialized>[]>;
    /**
     * Records array for redo
     */
    redoStack: Ref<UseRefHistoryRecord<Serialized>[]>;
    /**
     * A ref representing if undo is possible (non empty undoStack)
     */
    canUndo: Ref<boolean>;
    /**
     * A ref representing if redo is possible (non empty redoStack)
     */
    canRedo: Ref<boolean>;
    /**
     * Undo changes
     */
    undo(): void;
    /**
     * Redo changes
     */
    redo(): void;
    /**
     * Clear all the history
     */
    clear(): void;
    /**
     * Create new a new history record
     */
    commit(): void;
    /**
     * Reset ref's value with lastest history
     */
    reset(): void;
}
/**
 * Track the change history of a ref, also provides undo and redo functionality.
 *
 * @see https://vueuse.org/useManualRefHistory
 * @param source
 * @param options
 */
declare function useManualRefHistory<Raw, Serialized = Raw>(source: Ref<Raw>, options?: UseManualRefHistoryOptions<Raw, Serialized>): UseManualRefHistoryReturn<Raw, Serialized>;

/**
 * Many of the jsdoc definitions here are modified version of the
 * documentation from MDN(https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
 */
interface UseMediaSource {
    /**
     * The source url for the media
     */
    src: string;
    /**
     * The media codec type
     */
    type?: string;
}
interface UseMediaTextTrackSource {
    /**
     * Indicates that the track should be enabled unless the user's preferences indicate
     * that another track is more appropriate
     */
    default?: boolean;
    /**
     * How the text track is meant to be used. If omitted the default kind is subtitles.
     */
    kind: TextTrackKind;
    /**
     * A user-readable title of the text track which is used by the browser
     * when listing available text tracks.
     */
    label: string;
    /**
     * Address of the track (.vtt file). Must be a valid URL. This attribute
     * must be specified and its URL value must have the same origin as the document
     */
    src: string;
    /**
     * Language of the track text data. It must be a valid BCP 47 language tag.
     * If the kind attribute is set to subtitles, then srclang must be defined.
     */
    srcLang: string;
}
interface UseMediaControlsOptions extends ConfigurableDocument {
    /**
     * The source for the media, may either be a string, a `UseMediaSource` object, or a list
     * of `UseMediaSource` objects.
     */
    src?: MaybeRef<string | UseMediaSource | UseMediaSource[]>;
    /**
     * A list of text tracks for the media
     */
    tracks?: MaybeRef<UseMediaTextTrackSource[]>;
}
interface UseMediaTextTrack {
    /**
     * The index of the text track
     */
    id: number;
    /**
     * The text track label
     */
    label: string;
    /**
     * Language of the track text data. It must be a valid BCP 47 language tag.
     * If the kind attribute is set to subtitles, then srclang must be defined.
     */
    language: string;
    /**
     * Specifies the display mode of the text track, either `disabled`,
     * `hidden`, or `showing`
     */
    mode: TextTrackMode;
    /**
     * How the text track is meant to be used. If omitted the default kind is subtitles.
     */
    kind: TextTrackKind;
    /**
     * Indicates the track's in-band metadata track dispatch type.
     */
    inBandMetadataTrackDispatchType: string;
    /**
     * A list of text track cues
     */
    cues: TextTrackCueList | null;
    /**
     * A list of active text track cues
     */
    activeCues: TextTrackCueList | null;
}
declare function useMediaControls(target: MaybeRef<HTMLMediaElement | null | undefined>, options?: UseMediaControlsOptions): {
    currentTime: vue_demi.Ref<number>;
    duration: vue_demi.Ref<number>;
    buffering: vue_demi.Ref<boolean>;
    waiting: vue_demi.Ref<boolean>;
    seeking: vue_demi.Ref<boolean>;
    ended: vue_demi.Ref<boolean>;
    stalled: vue_demi.Ref<boolean>;
    buffered: vue_demi.Ref<[number, number][]>;
    playing: vue_demi.Ref<boolean>;
    volume: vue_demi.Ref<number>;
    muted: vue_demi.Ref<boolean>;
    tracks: vue_demi.Ref<{
        id: number;
        label: string;
        language: string;
        mode: TextTrackMode;
        kind: TextTrackKind;
        inBandMetadataTrackDispatchType: string;
        cues: ({
            [x: number]: {
                endTime: number;
                id: string;
                onenter: ((this: TextTrackCue, ev: Event) => any) | null;
                onexit: ((this: TextTrackCue, ev: Event) => any) | null;
                pauseOnExit: boolean;
                startTime: number;
                readonly track: {
                    readonly activeCues: (any & {
                        [Symbol.iterator]: () => IterableIterator<TextTrackCue>;
                    }) | null;
                    readonly cues: (any & {
                        [Symbol.iterator]: () => IterableIterator<TextTrackCue>;
                    }) | null;
                    readonly id: string;
                    readonly inBandMetadataTrackDispatchType: string;
                    readonly kind: TextTrackKind;
                    readonly label: string;
                    readonly language: string;
                    mode: TextTrackMode;
                    oncuechange: ((this: TextTrack, ev: Event) => any) | null;
                    addCue: (cue: TextTrackCue) => void;
                    removeCue: (cue: TextTrackCue) => void;
                    addEventListener: {
                        <K extends "cuechange">(type: K, listener: (this: TextTrack, ev: TextTrackEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
                        (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
                    };
                    removeEventListener: {
                        <K_1 extends "cuechange">(type: K_1, listener: (this: TextTrack, ev: TextTrackEventMap[K_1]) => any, options?: boolean | EventListenerOptions | undefined): void;
                        (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
                    };
                    dispatchEvent: (event: Event) => boolean;
                } | null;
                addEventListener: {
                    <K_2 extends keyof TextTrackCueEventMap>(type: K_2, listener: (this: TextTrackCue, ev: TextTrackCueEventMap[K_2]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
                    (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
                };
                removeEventListener: {
                    <K_3 extends keyof TextTrackCueEventMap>(type: K_3, listener: (this: TextTrackCue, ev: TextTrackCueEventMap[K_3]) => any, options?: boolean | EventListenerOptions | undefined): void;
                    (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
                };
                dispatchEvent: (event: Event) => boolean;
            };
            readonly length: number;
            getCueById: (id: string) => TextTrackCue | null;
            [Symbol.iterator]: () => IterableIterator<TextTrackCue>;
        } & {
            [Symbol.iterator]: () => IterableIterator<TextTrackCue>;
        }) | null;
        activeCues: ({
            [x: number]: {
                endTime: number;
                id: string;
                onenter: ((this: TextTrackCue, ev: Event) => any) | null;
                onexit: ((this: TextTrackCue, ev: Event) => any) | null;
                pauseOnExit: boolean;
                startTime: number;
                readonly track: {
                    readonly activeCues: (any & {
                        [Symbol.iterator]: () => IterableIterator<TextTrackCue>;
                    }) | null;
                    readonly cues: (any & {
                        [Symbol.iterator]: () => IterableIterator<TextTrackCue>;
                    }) | null;
                    readonly id: string;
                    readonly inBandMetadataTrackDispatchType: string;
                    readonly kind: TextTrackKind;
                    readonly label: string;
                    readonly language: string;
                    mode: TextTrackMode;
                    oncuechange: ((this: TextTrack, ev: Event) => any) | null;
                    addCue: (cue: TextTrackCue) => void;
                    removeCue: (cue: TextTrackCue) => void;
                    addEventListener: {
                        <K extends "cuechange">(type: K, listener: (this: TextTrack, ev: TextTrackEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
                        (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
                    };
                    removeEventListener: {
                        <K_1 extends "cuechange">(type: K_1, listener: (this: TextTrack, ev: TextTrackEventMap[K_1]) => any, options?: boolean | EventListenerOptions | undefined): void;
                        (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
                    };
                    dispatchEvent: (event: Event) => boolean;
                } | null;
                addEventListener: {
                    <K_2 extends keyof TextTrackCueEventMap>(type: K_2, listener: (this: TextTrackCue, ev: TextTrackCueEventMap[K_2]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
                    (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
                };
                removeEventListener: {
                    <K_3 extends keyof TextTrackCueEventMap>(type: K_3, listener: (this: TextTrackCue, ev: TextTrackCueEventMap[K_3]) => any, options?: boolean | EventListenerOptions | undefined): void;
                    (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
                };
                dispatchEvent: (event: Event) => boolean;
            };
            readonly length: number;
            getCueById: (id: string) => TextTrackCue | null;
            [Symbol.iterator]: () => IterableIterator<TextTrackCue>;
        } & {
            [Symbol.iterator]: () => IterableIterator<TextTrackCue>;
        }) | null;
    }[]>;
    selectedTrack: vue_demi.Ref<number>;
    enableTrack: (track: number | UseMediaTextTrack, disableTracks?: boolean) => void;
    disableTrack: (track?: number | UseMediaTextTrack | undefined) => void;
    supportsPictureInPicture: boolean | undefined;
    togglePictureInPicture: () => Promise<unknown>;
    isPictureInPicture: vue_demi.Ref<boolean>;
    onSourceError: _vueuse_shared.EventHookOn<Event>;
};
declare type UseMediaControlsReturn = ReturnType<typeof useMediaControls>;

/**
 * Reactive Media Query.
 *
 * @see https://vueuse.org/useMediaQuery
 * @param query
 * @param options
 */
declare function useMediaQuery(query: string, options?: ConfigurableWindow): vue_demi.Ref<boolean>;

interface MouseOptions extends ConfigurableWindow {
    /**
     * Listen to `touchmove` events
     *
     * @default true
     */
    touch?: boolean;
    /**
     * Reset to initial value when `touchend` event fired
     *
     * @default false
     */
    resetOnTouchEnds?: boolean;
    /**
     * Initial values
     */
    initialValue?: {
        x: number;
        y: number;
    };
}
declare type MouseSourceType = 'mouse' | 'touch' | null;
/**
 * Reactive mouse position.
 *
 * @see https://vueuse.org/useMouse
 * @param options
 */
declare function useMouse(options?: MouseOptions): {
    x: vue_demi.Ref<number>;
    y: vue_demi.Ref<number>;
    sourceType: vue_demi.Ref<MouseSourceType>;
};
declare type UseMouseReturn = ReturnType<typeof useMouse>;

interface MouseInElementOptions extends MouseOptions {
    handleOutside?: boolean;
}
/**
 * Reactive mouse position related to an element.
 *
 * @see https://vueuse.org/useMouseInElement
 * @param target
 * @param options
 */
declare function useMouseInElement(target?: MaybeElementRef, options?: MouseInElementOptions): {
    x: vue_demi.Ref<number>;
    y: vue_demi.Ref<number>;
    sourceType: vue_demi.Ref<MouseSourceType>;
    elementX: vue_demi.Ref<number>;
    elementY: vue_demi.Ref<number>;
    elementPositionX: vue_demi.Ref<number>;
    elementPositionY: vue_demi.Ref<number>;
    elementHeight: vue_demi.Ref<number>;
    elementWidth: vue_demi.Ref<number>;
    isOutside: vue_demi.Ref<boolean>;
    stop: () => void;
};
declare type UseMouseInElementReturn = ReturnType<typeof useMouseInElement>;

interface MousePressedOptions extends ConfigurableWindow {
    /**
     * Listen to `touchstart` `touchend` events
     *
     * @default true
     */
    touch?: boolean;
    /**
     * Initial values
     *
     * @default false
     */
    initialValue?: boolean;
    /**
     * Element target to be capture the click
     */
    target?: MaybeElementRef;
}
/**
 * Reactive mouse position.
 *
 * @see https://vueuse.org/useMousePressed
 * @param options
 */
declare function useMousePressed(options?: MousePressedOptions): {
    pressed: vue_demi.Ref<boolean>;
    sourceType: vue_demi.Ref<MouseSourceType>;
};
declare type UseMousePressedReturn = ReturnType<typeof useMousePressed>;

interface MutationObserverOptions extends MutationObserverInit, ConfigurableWindow {
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
declare function useMutationObserver(target: MaybeElementRef, callback: MutationCallback, options?: MutationObserverOptions): {
    isSupported: boolean | undefined;
    stop: () => void;
};
declare type UseMutationObserverReturn = ReturnType<typeof useMutationObserver>;

declare type NetworkType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
declare type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g' | undefined;
interface NetworkState {
    isSupported: boolean;
    /**
     * If the user is currently connected.
     */
    isOnline: Ref<boolean>;
    /**
     * The time since the user was last connected.
     */
    offlineAt: Ref<number | undefined>;
    /**
     * The download speed in Mbps.
     */
    downlink: Ref<number | undefined>;
    /**
     * The max reachable download speed in Mbps.
     */
    downlinkMax: Ref<number | undefined>;
    /**
    * The detected effective speed type.
    */
    effectiveType: Ref<NetworkEffectiveType | undefined>;
    /**
     * If the user activated data saver mode.
     */
    saveData: Ref<boolean | undefined>;
    /**
     * The detected connection/network type.
     */
    type: Ref<NetworkType>;
}
/**
 * Reactive Network status.
 *
 * @see https://vueuse.org/useNetwork
 * @param options
 */
declare function useNetwork(options?: ConfigurableWindow): NetworkState;

interface UseNowOptions<Controls extends boolean> {
    /**
     * Expose more controls
     *
     * @default false
     */
    controls?: Controls;
    /**
     * Update interval, or use requestAnimationFrame
     *
     * @default requestAnimationFrame
     */
    interval?: 'requestAnimationFrame' | number;
}
/**
 * Reactive current Date instance.
 *
 * @see https://vueuse.org/useNow
 * @param options
 */
declare function useNow(options?: UseNowOptions<false>): Ref<Date>;
declare function useNow(options: UseNowOptions<true>): {
    now: Ref<Date>;
} & Pausable;
declare type UseNowReturn = ReturnType<typeof useNow>;

/**
 * Reactive online state.
 *
 * @see https://vueuse.org/useOnline
 * @param options
 */
declare function useOnline(options?: ConfigurableWindow): vue.Ref<boolean>;

/**
 * Reactive state to show whether mouse leaves the page.
 *
 * @see https://vueuse.org/usePageLeave
 * @param options
 */
declare function usePageLeave(options?: ConfigurableWindow): vue_demi.Ref<boolean>;

interface ParallaxOptions extends ConfigurableWindow {
    deviceOrientationTiltAdjust?: (i: number) => number;
    deviceOrientationRollAdjust?: (i: number) => number;
    mouseTiltAdjust?: (i: number) => number;
    mouseRollAdjust?: (i: number) => number;
}
interface ParallaxReturn {
    /**
     * Roll value. Scaled to `-0.5 ~ 0.5`
     */
    roll: ComputedRef<number>;
    /**
     * Tilt value. Scaled to `-0.5 ~ 0.5`
     */
    tilt: ComputedRef<number>;
    /**
     * Sensor source, can be `mouse` or `deviceOrientation`
     */
    source: ComputedRef<'deviceOrientation' | 'mouse'>;
}
/**
 * Create parallax effect easily. It uses `useDeviceOrientation` and fallback to `useMouse`
 * if orientation is not supported.
 *
 * @param target
 * @param options
 */
declare function useParallax(target: MaybeElementRef, options?: ParallaxOptions): ParallaxReturn;

declare type DescriptorNamePolyfill = 'clipboard-read' | 'clipboard-write';
declare type GeneralPermissionDescriptor = PermissionDescriptor | DevicePermissionDescriptor | MidiPermissionDescriptor | PushPermissionDescriptor | {
    name: DescriptorNamePolyfill;
};
interface UsePermissionOptions<Controls extends boolean> extends ConfigurableNavigator {
    /**
     * Expose more controls
     *
     * @default false
     */
    controls?: Controls;
}
declare type UsePermissionReturn = Readonly<Ref<PermissionState | undefined>>;
interface UsePermissionReturnWithControls {
    state: UsePermissionReturn;
    isSupported: boolean;
    query: () => Promise<PermissionStatus | undefined>;
}
/**
 * Reactive Permissions API.
 *
 * @see https://vueuse.org/usePermission
 */
declare function usePermission(permissionDesc: GeneralPermissionDescriptor | GeneralPermissionDescriptor['name'], options?: UsePermissionOptions<false>): UsePermissionReturn;
declare function usePermission(permissionDesc: GeneralPermissionDescriptor | GeneralPermissionDescriptor['name'], options: UsePermissionOptions<true>): UsePermissionReturnWithControls;

declare enum SwipeDirection {
    UP = "UP",
    RIGHT = "RIGHT",
    DOWN = "DOWN",
    LEFT = "LEFT",
    NONE = "NONE"
}
interface SwipeOptions extends ConfigurableWindow {
    /**
     * Register events as passive
     *
     * @default true
     */
    passive?: boolean;
    /**
     * @default 50
     */
    threshold?: number;
    /**
     * Callback on swipe start
     */
    onSwipeStart?: (e: TouchEvent) => void;
    /**
     * Callback on swipe moves
     */
    onSwipe?: (e: TouchEvent) => void;
    /**
     * Callback on swipe ends
     */
    onSwipeEnd?: (e: TouchEvent, direction: SwipeDirection) => void;
}
interface SwipeReturn {
    isPassiveEventSupported: boolean;
    isSwiping: Ref<boolean>;
    direction: ComputedRef<SwipeDirection | null>;
    coordsStart: {
        readonly x: number;
        readonly y: number;
    };
    coordsEnd: {
        readonly x: number;
        readonly y: number;
    };
    lengthX: ComputedRef<number>;
    lengthY: ComputedRef<number>;
    stop: () => void;
}
/**
 * Reactive swipe detection.
 *
 * @see https://vueuse.org/useSwipe
 * @param target
 * @param options
 */
declare function useSwipe(target: MaybeRef<EventTarget | null | undefined>, options?: SwipeOptions): SwipeReturn;

interface PointerSwipeOptions {
    /**
     * @default 50
     */
    threshold?: number;
    /**
     * Callback on swipe start
     */
    onSwipeStart?: (e: PointerEvent) => void;
    /**
     * Callback on swipe move
     */
    onSwipe?: (e: PointerEvent) => void;
    /**
     * Callback on swipe end
     */
    onSwipeEnd?: (e: PointerEvent, direction: SwipeDirection) => void;
}
interface PointerPosition {
    x: number;
    y: number;
}
interface PointerSwipeReturn {
    readonly isSwiping: Ref<boolean>;
    direction: ComputedRef<SwipeDirection | null>;
    readonly posStart: PointerPosition;
    readonly posEnd: PointerPosition;
    distanceX: ComputedRef<number>;
    distanceY: ComputedRef<number>;
    stop: () => void;
}
/**
 * Reactive swipe detection based on PointerEvents.
 *
 * @see https://vueuse.org/usePointerSwipe
 * @param target
 * @param options
 */
declare function usePointerSwipe(target: MaybeRef<Element | null | undefined>, options?: PointerSwipeOptions): PointerSwipeReturn;

declare type ColorSchemeType = 'dark' | 'light' | 'no-preference';
/**
 * Reactive prefers-color-scheme media query.
 *
 * @see https://vueuse.org/usePreferredColorScheme
 * @param [options]
 */
declare function usePreferredColorScheme(options?: ConfigurableWindow): vue_demi.ComputedRef<ColorSchemeType>;

/**
 * Reactive dark theme preference.
 *
 * @see https://vueuse.org/usePreferredDark
 * @param [options]
 */
declare function usePreferredDark(options?: ConfigurableWindow): vue.Ref<boolean>;

/**
 * Reactive Navigator Languages.
 *
 * @see https://vueuse.org/usePreferredLanguages
 * @param options
 */
declare function usePreferredLanguages(options?: ConfigurableWindow): Ref<readonly string[]>;

interface RafFnOptions extends ConfigurableWindow {
    /**
     * Start the requestAnimationFrame loop immediately on creation
     *
     * @default true
     */
    immediate?: boolean;
}
/**
 * Call function on every `requestAnimationFrame`. With controls of pausing and resuming.
 *
 * @see https://vueuse.org/useRafFn
 * @param fn
 * @param options
 */
declare function useRafFn(fn: Fn, options?: RafFnOptions): Pausable;

interface UseRefHistoryOptions<Raw, Serialized = Raw> {
    /**
     * Watch for deep changes, default to false
     *
     * When set to true, it will also create clones for values store in the history
     *
     * @default false
     */
    deep?: boolean;
    /**
     * The flush option allows for greater control over the timing of a history point, default to 'pre'
     *
     * Possible values: 'pre', 'post', 'sync'
     * It works in the same way as the flush option in watch and watch effect in vue reactivity
     *
     * @default 'pre'
     */
    flush?: 'pre' | 'post' | 'sync';
    /**
     * Maximum number of history to be kept. Default to unlimited.
     */
    capacity?: number;
    /**
     * Clone when taking a snapshot, shortcut for dump: JSON.parse(JSON.stringify(value)).
     * Default to false
     *
     * @default false
     */
    clone?: boolean | CloneFn<Raw>;
    /**
     * Serialize data into the history
     */
    dump?: (v: Raw) => Serialized;
    /**
     * Deserialize data from the history
     */
    parse?: (v: Serialized) => Raw;
}
interface UseRefHistoryReturn<Raw, Serialized> {
    /**
     * Bypassed tracking ref from the argument
     */
    source: Ref<Raw>;
    /**
     * An array of history records for undo, newest comes to first
     */
    history: Ref<UseRefHistoryRecord<Serialized>[]>;
    /**
    * Last history point, source can be different if paused
    */
    last: Ref<UseRefHistoryRecord<Serialized>>;
    /**
     * Same as 'history'
     */
    undoStack: Ref<UseRefHistoryRecord<Serialized>[]>;
    /**
     * Records array for redo
     */
    redoStack: Ref<UseRefHistoryRecord<Serialized>[]>;
    /**
     * A ref representing if the tracking is enabled
     */
    isTracking: Ref<boolean>;
    /**
     * A ref representing if undo is possible (non empty undoStack)
     */
    canUndo: Ref<boolean>;
    /**
     * A ref representing if redo is possible (non empty redoStack)
     */
    canRedo: Ref<boolean>;
    /**
     * Undo changes
     */
    undo(): void;
    /**
     * Redo changes
     */
    redo(): void;
    /**
     * Clear all the history
     */
    clear(): void;
    /**
     * Pause change tracking
     */
    pause(): void;
    /**
     * Resume change tracking
     *
     * @param [commit] if true, a history record will be create after resuming
     */
    resume(commit?: boolean): void;
    /**
     * Create new a new history record
     */
    commit(): void;
    /**
     * Reset ref's value with lastest history
     */
    reset(): void;
    /**
     * A sugar for auto pause and auto resuming within a function scope
     *
     * @param fn
     */
    batch(fn: (cancel: Fn) => void): void;
    /**
     * Clear the data and stop the watch
     */
    dispose(): void;
}
/**
 * Track the change history of a ref, also provides undo and redo functionality.
 *
 * @see https://vueuse.org/useRefHistory
 * @param source
 * @param options
 */
declare function useRefHistory<Raw, Serialized = Raw>(source: Ref<Raw>, options?: UseRefHistoryOptions<Raw, Serialized>): UseRefHistoryReturn<Raw, Serialized>;

interface UseScriptTagOptions extends ConfigurableDocument {
    /**
     * Load the script immediately
     *
     * @default true
     */
    immediate?: boolean;
    /**
     * Add `async` attribute to the script tag
     *
     * @default true
     */
    async?: boolean;
    /**
     * Script type
     *
     * @default 'text/javascript'
     */
    type?: string;
    /**
     * Manual controls the timing of loading and unloading
     *
     * @default false
     */
    manual?: boolean;
    crossOrigin?: 'anonymous' | 'use-credentials';
    referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
    noModule?: boolean;
    defer?: boolean;
}
/**
 * Async script tag loading.
 *
 * @see https://vueuse.org/useScriptTag
 * @param src
 */
declare function useScriptTag(src: MaybeRef<string>, onLoaded?: (el: HTMLScriptElement) => void, options?: UseScriptTagOptions): {
    scriptTag: vue_demi.Ref<HTMLScriptElement | null>;
    load: (waitForScriptLoad?: boolean) => Promise<HTMLScriptElement | boolean>;
    unload: () => void;
};
declare type UseScriptTagReturn = ReturnType<typeof useScriptTag>;

declare function useSessionStorage(key: string, defaultValue: string, options?: StorageOptions<string>): Ref<string>;
declare function useSessionStorage(key: string, defaultValue: boolean, options?: StorageOptions<boolean>): Ref<boolean>;
declare function useSessionStorage(key: string, defaultValue: number, options?: StorageOptions<number>): Ref<number>;
declare function useSessionStorage<T>(key: string, defaultValue: T, options?: StorageOptions<T>): Ref<T>;
declare function useSessionStorage<T = unknown>(key: string, defaultValue: null, options?: StorageOptions<T>): Ref<T>;

interface ShareOptions {
    title?: string;
    files?: File[];
    text?: string;
    url?: string;
}
/**
 * Reactive Web Share API.
 *
 * @see https://vueuse.org/useShare
 * @param shareOptions
 * @param options
 */
declare function useShare(shareOptions?: MaybeRef<ShareOptions>, options?: ConfigurableNavigator): {
    isSupported: boolean;
    share: (overrideOptions?: MaybeRef<ShareOptions>) => Promise<void>;
};
declare type UseShareReturn = ReturnType<typeof useShare>;

interface SpeechRecognitionOptions extends ConfigurableWindow {
    /**
     * Controls whether continuous results are returned for each recognition, or only a single result.
     *
     * @default true
     */
    continuous?: boolean;
    /**
     * Controls whether interim results should be returned (true) or not (false.) Interim results are results that are not yet final
     *
     * @default true
     */
    interimResults?: boolean;
    /**
     * Langauge for SpeechRecognition
     *
     * @default 'en-US'
     */
    lang?: string;
}
/**
 * Reactive SpeechRecognition.
 *
 * @see https://vueuse.org/useSpeechRecognition
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition SpeechRecognition
 * @param options
 */
declare function useSpeechRecognition(options?: SpeechRecognitionOptions): {
    isSupported: boolean;
    isListening: Ref<boolean>;
    isFinal: Ref<boolean>;
    recognition: SpeechRecognition | undefined;
    result: Ref<string>;
    error: Ref<SpeechRecognitionErrorEvent | undefined>;
    toggle: (value?: boolean) => void;
    start: () => void;
    stop: () => void;
};
declare type UseSpeechRecognitionReturn = ReturnType<typeof useSpeechRecognition>;

declare type MessageFormatter<T = number> = (value: T, isPast: boolean) => string;
interface TimeAgoMessages {
    justNow: string;
    past: string | MessageFormatter<string>;
    future: string | MessageFormatter<string>;
    year: string | MessageFormatter<number>;
    month: string | MessageFormatter<number>;
    day: string | MessageFormatter<number>;
    week: string | MessageFormatter<number>;
    hour: string | MessageFormatter<number>;
    minute: string | MessageFormatter<number>;
    second: string | MessageFormatter<number>;
}
interface TimeAgoOptions<Controls extends boolean> {
    /**
     * Expose more controls
     *
     * @default false
     */
    controls?: Controls;
    /**
     * Intervals to update, set 0 to disable auto update
     *
     * @default 30_000
     */
    updateInterval?: number;
    /**
     * Maximum unit (of diff in milliseconds) to display the full date instead of relative
     *
     * @default undefined
     */
    max?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | number;
    /**
     * Formatter for full date
     */
    fullDateFormatter?: (date: Date) => string;
    /**
     * Messages for formating the string
     */
    messages?: TimeAgoMessages;
}
/**
 * Reactive time ago formatter.
 *
 * @see https://vueuse.org/useTimeAgo
 * @param options
 */
declare function useTimeAgo(time: MaybeRef<Date | number | string>, options?: TimeAgoOptions<false>): ComputedRef<string>;
declare function useTimeAgo(time: MaybeRef<Date | number | string>, options: TimeAgoOptions<true>): {
    timeAgo: ComputedRef<string>;
} & Pausable;

interface TimestampOptions<Controls extends boolean> {
    /**
     * Expose more controls
     *
     * @default false
     */
    controls?: Controls;
    /**
     * Offset value adding to the value
     *
     * @default 0
     */
    offset?: number;
    /**
     * Update interval, or use requestAnimationFrame
     *
     * @default requestAnimationFrame
     */
    interval?: 'requestAnimationFrame' | number;
}
/**
 * Reactive current timestamp.
 *
 * @see https://vueuse.org/useTimestamp
 * @param options
 */
declare function useTimestamp(options?: TimestampOptions<false>): Ref<number>;
declare function useTimestamp(options: TimestampOptions<true>): {
    timestamp: Ref<number>;
} & Pausable;
declare type UseTimestampReturn = ReturnType<typeof useTimestamp>;

interface UseTitleOptions extends ConfigurableDocument {
    /**
     * Observe `document.title` changes using MutationObserve
     *
     * @default false
     */
    observe?: boolean;
}
/**
 * Reactive document title.
 *
 * @see https://vueuse.org/useTitle
 * @param newTitle
 * @param options
 */
declare function useTitle(newTitle?: MaybeRef<string | null | undefined>, options?: UseTitleOptions): vue_demi.Ref<string | null | undefined>;

/**
 * Cubic bezier points
 */
declare type CubicBezierPoints = [number, number, number, number];
/**
 * Easing function
 */
declare type EasingFunction = (n: number) => number;
/**
 * Transition options
 */
declare type TransitionOptions = {
    /**
     * Milliseconds to wait before starting transition
     */
    delay?: MaybeRef<number>;
    /**
     * Disables the transition
     */
    disabled?: MaybeRef<boolean>;
    /**
     * Transition duration in milliseconds
     */
    duration?: MaybeRef<number>;
    /**
     * Callback to execute after transition finishes
     */
    onFinished?: () => void;
    /**
     * Callback to execute after transition starts
     */
    onStarted?: () => void;
    /**
     * Easing function or cubic bezier points for calculating transition values
     */
    transition?: MaybeRef<EasingFunction | CubicBezierPoints>;
};
/**
 * Common transitions
 *
 * @see https://easings.net
 */
declare const TransitionPresets: Record<string, CubicBezierPoints | EasingFunction>;
declare function useTransition(source: Ref<number>, options?: TransitionOptions): ComputedRef<number>;
declare function useTransition<T extends MaybeRef<number>[]>(source: [...T], options?: TransitionOptions): ComputedRef<{
    [K in keyof T]: number;
}>;
declare function useTransition<T extends Ref<number[]>>(source: T, options?: TransitionOptions): ComputedRef<number[]>;

declare type UrlParams = Record<string, string[] | string>;
/**
 * Reactive URLSearchParams
 *
 * @see https://vueuse.org/useUrlSearchParams
 * @param mode
 * @param options
 */
declare function useUrlSearchParams<T extends Record<string, any> = UrlParams>(mode?: 'history' | 'hash', options?: ConfigurableWindow): T;

interface UseUserMediaOptions extends ConfigurableNavigator {
    /**
     * If the stream is enabled
     * @default false
     */
    enabled?: MaybeRef<boolean>;
    /**
     * Recreate stream when the input devices id changed
     *
     * @default true
     */
    autoSwitch?: MaybeRef<boolean>;
    /**
     * The device id of video input
     *
     * When passing with `undefined` the default device will be used.
     * Pass `false` or "none" to disabled video input
     *
     * @default undefined
     */
    videoDeviceId?: MaybeRef<string | undefined | false | 'none'>;
    /**
     * The device id of audi input
     *
     * When passing with `undefined` the default device will be used.
     * Pass `false` or "none" to disabled audi input
     *
     * @default undefined
     */
    audioDeviceId?: MaybeRef<string | undefined | false | 'none'>;
}
/**
 * Reactive `mediaDevices.getUserMedia` streaming
 *
 * @see https://vueuse.org/useUserMedia
 * @param options
 */
declare function useUserMedia(options?: UseUserMediaOptions): {
    isSupported: boolean;
    stream: Ref<MediaStream | undefined>;
    start: () => Promise<MediaStream | undefined>;
    stop: () => void;
    restart: () => Promise<MediaStream | undefined>;
    videoDeviceId: Ref<string | false | undefined>;
    audioDeviceId: Ref<string | false | undefined>;
    enabled: Ref<boolean>;
    autoSwitch: Ref<boolean>;
};
declare type UseUserMediaReturn = ReturnType<typeof useUserMedia>;

interface VModelOptions {
    /**
     * When passive is set to `true`, it will use `watch` to sync with props and ref.
     * Instead of relying on the `v-model` or `.sync` to work.
     *
     * @default false
     */
    passive?: boolean;
    /**
     * When eventName is set, it's value will be used to overwrite the emit event name.
     *
     * @default undefined
     */
    eventName?: string;
}
/**
 * Shorthand for v-model binding, props + emit -> ref
 *
 * @see https://vueuse.org/useVModel
 * @param props
 * @param key (default 'value' in Vue 2 and 'modelValue' in Vue 3)
 * @param emit
 */
declare function useVModel<P extends object, K extends keyof P, Name extends string>(props: P, key?: K, emit?: (name: Name, ...args: any[]) => void, options?: VModelOptions): vue_demi.Ref<vue_demi.UnwrapRef<P[K]>> | vue_demi.WritableComputedRef<P[K]>;

/**
 * Shorthand for props v-model binding. Think like `toRefs(props)` but changes will also emit out.
 *
 * @see https://vueuse.org/useVModels
 * @param props
 * @param emit
 */
declare function useVModels<P extends object, Name extends string>(props: P, emit?: (name: Name, ...args: any[]) => void, options?: VModelOptions): ToRefs<P>;

declare type WebSocketStatus = 'OPEN' | 'CONNECTING' | 'CLOSED';
interface WebSocketOptions {
    onConnected?: (ws: WebSocket) => void;
    onDisconnected?: (ws: WebSocket, event: CloseEvent) => void;
    onError?: (ws: WebSocket, event: Event) => void;
    onMessage?: (ws: WebSocket, event: MessageEvent) => void;
    /**
     * Send heartbeat for every x milliseconds passed
     *
     * @default false
     */
    heartbeat?: boolean | {
        /**
         * Message for the heartbeat
         *
         * @default 'ping'
         */
        message?: string;
        /**
         * Interval, in milliseconds
         *
         * @default 1000
         */
        interval?: number;
    };
    /**
     * Enabled auto reconnect
     *
     * @default false
     */
    autoReconnect?: boolean | {
        /**
         * Maximum retry times.
         *
         * @default -1
         */
        retries?: number;
        /**
         * Delay for reconnect, in milliseconds
         *
         * @default 1000
         */
        delay?: number;
        /**
         * On maximum retry times reached.
         */
        onFailed?: Fn;
    };
    /**
     * Automatically open a connection
     *
     * @default true
     */
    immediate?: boolean;
}
interface WebSocketResult<T> {
    /**
     * Reference to the latest data received via the websocket,
     * can be watched to respond to incoming messages
     */
    data: Ref<T | null>;
    /**
     * The current websocket status, can be only one of:
     * 'OPEN', 'CONNECTING', 'CLOSED'
     */
    status: Ref<WebSocketStatus>;
    /**
     * Closes the websocket connection gracefully.
     */
    close: WebSocket['close'];
    /**
     * Reopen the websocket connection.
     * If there the current one is active, will close it before opening a new one.
     */
    open: Fn;
    /**
     * Sends data through the websocket connection.
     *
     * @param data
     * @param useBuffer when the socket is not yet open, store the data into the buffer and sent them one connected. Default to true.
     */
    send: (data: string | ArrayBuffer | Blob, useBuffer?: boolean) => boolean;
    /**
     * Reference to the WebSocket instance.
     */
    ws: Ref<WebSocket | undefined>;
}
/**
 * Reactive WebSocket client.
 *
 * @see https://vueuse.org/useWebSocket
 * @param url
 */
declare function useWebSocket<Data = any>(url: string, options?: WebSocketOptions): WebSocketResult<Data>;

/**
 * Simple Web Workers registration and communication.
 *
 * @see https://vueuse.org/useWebWorker
 * @param url
 * @param workerOptions
 * @param options
 */
declare function useWebWorker(url: string, workerOptions?: WorkerOptions, options?: ConfigurableWindow): {
    data: Ref<any>;
    post: {
        (message: any, transfer: Transferable[]): void;
        (message: any, options?: PostMessageOptions | undefined): void;
    };
    terminate: () => void;
    worker: Ref<Worker | undefined>;
};
declare type UseWebWorkerReturn = ReturnType<typeof useWebWorker>;

declare type WebWorkerStatus = 'PENDING' | 'SUCCESS' | 'RUNNING' | 'ERROR' | 'TIMEOUT_EXPIRED';
interface WebWorkerOptions extends ConfigurableWindow {
    /**
     * Number of milliseconds before killing the worker
     *
     * @default undefined
     */
    timeout?: number;
    /**
     * An array that contains the external dependencies needed to run the worker
     */
    dependencies?: string[];
}
/**
 * Run expensive function without blocking the UI, using a simple syntax that makes use of Promise.
 *
 * @see https://vueuse.org/useWebWorkerFn
 * @param fn
 * @param options
 */
declare const useWebWorkerFn: <T extends (...fnArgs: any[]) => any>(fn: T, options?: WebWorkerOptions) => {
    workerFn: (...fnArgs: Parameters<T>) => Promise<ReturnType<T>>;
    workerStatus: vue_demi.Ref<WebWorkerStatus>;
    workerTerminate: (status?: WebWorkerStatus) => void;
};
declare type UseWebWorkerFnReturn = ReturnType<typeof useWebWorkerFn>;

/**
 * Reactive window scroll.
 *
 * @see https://vueuse.org/useWindowScroll
 * @param options
 */
declare function useWindowScroll({ window }?: ConfigurableWindow): {
    x: vue_demi.Ref<number>;
    y: vue_demi.Ref<number>;
};
declare type UseWindowScrollReturn = ReturnType<typeof useWindowScroll>;

interface WindowSizeOptions extends ConfigurableWindow {
    initialWidth?: number;
    initialHeight?: number;
}
/**
 * Reactive window size.
 *
 * @see https://vueuse.org/useWindowSize
 * @param options
 */
declare function useWindowSize({ window, initialWidth, initialHeight }?: WindowSizeOptions): {
    width: vue_demi.Ref<number>;
    height: vue_demi.Ref<number>;
};
declare type UseWindowSizeReturn = ReturnType<typeof useWindowSize>;

export { AfterFetchContext, AsyncComputedOnCancel, AsyncComputedOptions, AsyncStateOptions, BatteryManager, BeforeFetchContext, Breakpoints, BrowserLocationState, ClipboardOptions, ClipboardReturn, CloneFn, ColorSchemeType, ColorSchemes, CreateFetchOptions, CreateGlobalStateReturn, DefaultMagicKeysAliasMap, DeviceMotionOptions, DocumentEventName, ElementSize, FaviconOptions, GeneralEventListener, GeneralPermissionDescriptor, GeolocationOptions, IdleOptions, IntersectionObserverOptions, KeyFilter, KeyPredicate, KeyStrokeEventName, KeyStrokeOptions, MagicKeys, MagicKeysInternal, MaybeElementRef, MessageFormatter, MouseInElementOptions, MouseOptions, MousePressedOptions, MouseSourceType, MutationObserverOptions, NetworkEffectiveType, NetworkState, NetworkType, OnClickOutsideEvents, OnClickOutsideOptions, ParallaxOptions, ParallaxReturn, PointerPosition, PointerSwipeOptions, PointerSwipeReturn, RafFnOptions, ResizeObserverCallback, ResizeObserverEntry, ResizeObserverOptions, ResizeObserverSize, Serializer, ShareOptions, SpeechRecognitionOptions, StorageLike, StorageOptions, SwipeDirection, SwipeOptions, SwipeReturn, TimeAgoMessages, TimeAgoOptions, TimestampOptions, TransitionOptions, TransitionPresets, UrlParams, UseAsyncStateReturn, UseBatteryReturn, UseBreakpointsReturn, UseBrowserLocationReturn, UseDarkOptions, UseDeviceMotionReturn, UseDeviceOrientationReturn, UseDevicePixelRatioReturn, UseDevicesListOptions, UseDevicesListReturn, UseElementBoundingReturn, UseElementSizeReturn, UseEventListenerReturn, UseFetchOptions, UseFetchReturn, UseFullscreenReturn, UseGeolocationReturn, UseIdleReturn, UseIntersectionObserverReturn, UseMagicKeysOptions, UseManualRefHistoryOptions, UseManualRefHistoryReturn, UseMediaControlsReturn, UseMediaSource, UseMediaTextTrack, UseMediaTextTrackSource, UseMouseInElementReturn, UseMousePressedReturn, UseMouseReturn, UseMutationObserverReturn, UseNowOptions, UseNowReturn, UsePermissionOptions, UsePermissionReturn, UsePermissionReturnWithControls, UseRefHistoryOptions, UseRefHistoryRecord, UseRefHistoryReturn, UseResizeObserverReturn, UseScriptTagOptions, UseScriptTagReturn, UseShareReturn, UseSpeechRecognitionReturn, UseTimestampReturn, UseTitleOptions, UseUserMediaOptions, UseUserMediaReturn, UseWebWorkerFnReturn, UseWebWorkerReturn, UseWindowScrollReturn, UseWindowSizeReturn, VModelOptions, VisibilityScrollTargetOptions, VueInstance, WebSocketOptions, WebSocketResult, WebSocketStatus, WebWorkerOptions, WebWorkerStatus, WindowEventName, WindowSizeOptions, asyncComputed, autoResetRef, breakpointsAntDesign, breakpointsBootstrapV5, breakpointsSematic, breakpointsTailwind, breakpointsVuetify, createFetch, createGlobalState, onClickOutside, onKeyDown, onKeyPressed, onKeyStroke, onKeyUp, onStartTyping, templateRef, toRefs, unrefElement, useActiveElement, useAsyncState, useBattery, useBreakpoints, useBrowserLocation, useClipboard, useCssVar, useDark, useDeviceMotion, useDeviceOrientation, useDevicePixelRatio, useDevicesList, useDocumentVisibility, useElementBounding, useElementSize, useElementVisibility, useEventListener, useEventSource, useFavicon, useFetch, useFullscreen, useGeolocation, useIdle, useIntersectionObserver, useLocalStorage, useMagicKeys, useManualRefHistory, useMediaControls, useMediaQuery, useMouse, useMouseInElement, useMousePressed, useMutationObserver, useNetwork, useNow, useOnline, usePageLeave, useParallax, usePermission, usePointerSwipe, usePreferredColorScheme, usePreferredDark, usePreferredLanguages, useRafFn, useRefHistory, useResizeObserver, useScriptTag, useSessionStorage, useShare, useSpeechRecognition, useStorage, useSwipe, useTimeAgo, useTimestamp, useTitle, useTransition, useUrlSearchParams, useUserMedia, useVModel, useVModels, useWebSocket, useWebWorker, useWebWorkerFn, useWindowScroll, useWindowSize };
