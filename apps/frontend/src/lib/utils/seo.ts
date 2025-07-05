import { APP_NAME } from '$lib';

export interface SEOData {
	title?: string;
	description?: string;
	keywords?: string;
	canonical?: string;
	image?: string;
	type?: 'website' | 'article';
	noindex?: boolean;
}

export function generateSEOTags(data: SEOData, currentUrl: string) {
	const title = data.title ? `${data.title} - ${APP_NAME}` : APP_NAME;
	const description = data.description || 'Aplicación web ligera para organizar tu vida académica universitaria';
	const canonical = data.canonical || currentUrl;
	const image = data.image || '/favicon.svg';
	
	return {
		title,
		description,
		canonical,
		keywords: data.keywords,
		openGraph: {
			title,
			description,
			url: canonical,
			image,
			type: data.type || 'website'
		},
		twitter: {
			title,
			description,
			image
		},
		robots: data.noindex ? 'noindex, follow' : 'index, follow'
	};
}

export function createStructuredData(type: 'WebPage' | 'BreadcrumbList', data: any) {
	const baseStructure = {
		'@context': 'https://schema.org',
		'@type': type
	};
	
	return {
		...baseStructure,
		...data
	};
}
