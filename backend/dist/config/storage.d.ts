export declare const storagePaths: {
    base: string;
    walkthroughs: (walkthroughId: string) => string;
    scenes: (walkthroughId: string) => string;
    thumbnails: (walkthroughId: string) => string;
    exports: (walkthroughId: string) => string;
};
export declare function initializeStorage(): void;
export declare function createWalkthroughStorage(walkthroughId: string): void;
export declare function getFileUrl(filePath: string): string;
//# sourceMappingURL=storage.d.ts.map