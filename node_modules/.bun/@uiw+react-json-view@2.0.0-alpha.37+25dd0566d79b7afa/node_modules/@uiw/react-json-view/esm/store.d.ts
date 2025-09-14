import React, { type PropsWithChildren } from 'react';
import { type JsonViewProps } from './';
import { type InitialTypesState, type TagType } from './store/Types';
export type BlockTagType = keyof JSX.IntrinsicElements;
export interface InitialState<T extends object> {
    value?: object;
    onExpand?: JsonViewProps<object>['onExpand'];
    onCopied?: JsonViewProps<object>['onCopied'];
    beforeCopy?: JsonViewProps<T>['beforeCopy'];
    objectSortKeys?: JsonViewProps<T>['objectSortKeys'];
    displayObjectSize?: JsonViewProps<T>['displayObjectSize'];
    shortenTextAfterLength?: JsonViewProps<T>['shortenTextAfterLength'];
    stringEllipsis?: JsonViewProps<T>['stringEllipsis'];
    enableClipboard?: JsonViewProps<T>['enableClipboard'];
    highlightUpdates?: JsonViewProps<T>['highlightUpdates'];
    collapsed?: JsonViewProps<T>['collapsed'];
    shouldExpandNodeInitially?: JsonViewProps<T>['shouldExpandNodeInitially'];
    indentWidth?: number;
}
export declare const initialState: InitialState<object>;
type Dispatch = React.Dispatch<InitialState<object>>;
export declare const Context: React.Context<InitialState<object>>;
export declare function reducer(state: InitialState<object>, action: InitialState<object>): InitialState<object>;
export declare const useStore: () => InitialState<object>;
export declare const useDispatchStore: () => Dispatch;
export interface ProviderProps<T extends TagType> {
    initialState?: InitialState<object>;
    initialTypes?: InitialTypesState<T>;
}
export declare const Provider: {
    <T extends TagType>({ children, initialState: init, initialTypes, }: PropsWithChildren<ProviderProps<T>>): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare function useDispatch(): Dispatch;
export {};
