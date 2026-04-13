/**
 * Formatters utilities for IDs
 */

export const formatOrderId = (id: number | string | undefined | null): string => {
    if (!id) return '';
    return `Ord-ht_f05-${id}`;
};

export const formatProductId = (id: number | string | undefined | null): string => {
    if (!id) return '';
    return `Prod-ht_f05-${id}`;
};

export const formatClientId = (id: number | string | undefined | null): string => {
    if (!id) return '';
    return `Cli-ht_f06-${id}`;
};

export const formatVendorId = (id: number | string | undefined | null): string => {
    if (!id) return '';
    return `Vend-ht_f07-${id}`;
};
