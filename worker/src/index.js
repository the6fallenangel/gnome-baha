const KV_KEY = 'latest_rates';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname === '/latest') {
			return await handleLatest(env);
		}

		return new Response('Baha worker is running.', { status: 200 });
	},

	async scheduled(event, env, ctx) {
		await refreshRates(env);
	},
};

async function handleLatest(env) {
	const cached = await env.BAHA_RATES.get(KV_KEY);

	if (cached) {
		return new Response(cached, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	}

	const data = await refreshRates(env);
	return Response.json(data ?? { error: 'No data available yet' }, { status: data ? 200 : 503 });
}

async function refreshRates(env) {
	try {
		const res = await fetch(env.API_URL, {
			headers: {
				Authorization: `Bearer ${env.API_KEY}`,
			},
		});
		if (!res.ok) return null;

		const data = await res.json();

		await env.BAHA_RATES.put(KV_KEY, JSON.stringify(data), {
			expirationTtl: 86400,
		});

		return data;
	} catch (err) {
		return null;
	}
}
