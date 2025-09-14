// TypeScript interfaces for the Shopping Comparator API

export interface SearchRequest {
    prompt: string;
    sites: string[];
    filters?: SearchFilters;
}

export interface SearchResponse {
    job_id: string;
}

export interface SearchFilters {
    size?: string | string[];  // Support single or multiple sizes
    material?: string | string[];  // Support single or multiple materials
    min_price?: number;
    max_price?: number;
    min_rating?: number;
    color?: string;
    category?: string;
    site?: string | string[];  // Support single or multiple sites
}

export interface Product {
    title: string;
    name?: string; // Alternative name field
    price: number;
    size?: string;
    material?: string;
    image_url: string;
    product_url: string;
    url?: string; // Alternative URL field
    site: string;
    confidence: number;
    productId?: string;
    category?: string;
    rating?: number;
    reviews_count?: number;  // Updated field name to match backend
}

export interface JobStatusResponse {
    status: 'pending' | 'running' | 'completed' | 'failed';
    results: Product[];
    logs: string[];
}

export interface SearchJob {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    results: Product[];
    logs: string[];
    createdAt: Date;
}

// WebSocket message types
export interface WebSocketMessage {
    type: string;
    status?: string;
    results?: Product[];
    job_id?: string;
}

// Component props interfaces
export interface SearchFormProps {
    onSearch: (request: SearchRequest) => void;
    isLoading?: boolean;
}

export interface ResultsTableProps {
    results: Product[];
    onSort?: (field: keyof Product) => void;
    onFilter?: (filters: Partial<SearchFilters>) => void;
}

export interface ProgressFeedProps {
    jobId?: string;
    status?: string;
    logs: string[];
    onStatusUpdate?: (status: string) => void;
}

// Site configuration - Original sites with Google Shopping backend
export interface SiteConfig {
    name: string;
    displayName: string;
    baseUrl?: string; // Made optional since we don't need it on frontend
}

export const AVAILABLE_SITES: SiteConfig[] = [
    { name: 'myntra', displayName: 'Myntra' },
    { name: 'meesho', displayName: 'Meesho' },
    { name: 'nykaa', displayName: 'Nykaa' },
    { name: 'fabindia', displayName: 'Fab India' },
];
