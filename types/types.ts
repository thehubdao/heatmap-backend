type valuationTransfer = {
	timestamp: number;
	time: string;
	price: number;
	priceUsd: number;
	owner: string;
	eth_price: number;
};

export type ValuationTile = {
	name: string;
	predicted_price: number;
	eth_predicted_price: number;
	history?: valuationTransfer[];
	variation_last_week: number;
	variation_last_four_weeks: number;
	variation_last_six_months: number;
	manipulation_index: number;
	suggested_operation?: string;
	coords: { x: number; y: number };
	center: { x: number; y: number };
	current_price_eth?: number;
	best_offered_price_eth?: number;
	percent?: number;
	land_id?: string;
	watchlist?: boolean;
	portfolio?: boolean;
	images: { image_url: string };
	owner?: string;
	external_link: string;
	floor_adjusted_predicted_price?: number;
	tokenId?: string;
};

export type MapFilter =
	| 'eth_predicted_price'
	| 'price_difference'
	| 'transfers'
	| 'basic'
	| 'listed_lands'
	| 'floor_adjusted_predicted_price'
	| 'last_month_sells';

export type ValueOf<T> = T[keyof T];
