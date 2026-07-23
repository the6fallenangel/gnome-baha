export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname === '/latest') {
			return await handleLatest(env);
		}

		return new Response('Baha worker is running.', { status: 200 });
	},
};

async function handleLatest(env) {
	try {
		const res = await fetch(env.API);

		if (!res.ok) {
			return Response.json({ error: 'Upstream api error', status: res.status }, { status: 502 });
		}

		const data = await res.json();

		return Response.json(data, {
			headers: { 'Cache-Control': 'no-store' },
		});
	} catch (err) {
		return Response.json({ error: 'Failed to fetch upstream data' }, { status: 500 });
	}
}
