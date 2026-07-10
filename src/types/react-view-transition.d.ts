// Activates the canary React type augmentations that declare `ViewTransition`
// and `addTransitionType`. Next 16's bundled React exports these at runtime;
// this makes `import { ViewTransition } from "react"` type-check.
/// <reference types="react/canary" />
