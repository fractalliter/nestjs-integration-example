import getCacheControl from "./utils/getCacheControl";

describe("Utils", () => {
	it("get max age from headers", () => {
		const ttl = 560;
		const headers = {"cache-control": "private, max-age=560"};
		const maxAge = getCacheControl(headers);
		expect(maxAge).toEqual(ttl);
	});
})