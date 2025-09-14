import { type TagType } from '../store/Types';
import { type SectionElement } from '../store/Section';
export type CopiedSectionElement<T extends TagType = 'svg'> = SectionElement<T> & {
    beforeCopy?: (copyText: string, keyName?: string | number, value?: object, parentValue?: object, expandKey?: string, keys?: (number | string)[]) => string;
};
export declare const Copied: {
    <K extends TagType = "svg">(props: CopiedSectionElement<K>): null;
    displayName: string;
};
