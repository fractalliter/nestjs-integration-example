import {AxiosResponseHeaders} from "axios";

export default (headers: AxiosResponseHeaders): number => {
	const matches = headers['cache-control']?.match(/max-age=(\d+)/);
	const maxAge = matches ? parseInt(matches[1], 10) : -1;
	return maxAge;
}