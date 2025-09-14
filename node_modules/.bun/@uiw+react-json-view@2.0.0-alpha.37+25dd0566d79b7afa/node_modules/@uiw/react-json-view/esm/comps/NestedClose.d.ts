import { type SectionElementResult } from '../store/Section';
interface NestedCloseProps<T extends object> extends SectionElementResult<T> {
    expandKey: string;
    level: number;
}
export declare const NestedClose: {
    <T extends object>(props: NestedCloseProps<T>): import("react/jsx-runtime").JSX.Element | null;
    displayName: string;
};
export {};
