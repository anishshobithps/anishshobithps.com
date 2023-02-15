/// <reference types="astro/client" />
/// <reference types="@astrojs/image/client" />


export interface MetaSEO {
    title?: string;
    description?: string;
    image?: string;
  
    canonical?: string | URL;
    noindex?: boolean;
    nofollow?: boolean;
  
    ogTitle?: string;
    ogType?: string;
}
