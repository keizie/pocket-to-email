import axios from 'axios';

const pocket_url = 'https://getpocket.com/v3';
const consumer_key = process.env.POCKET_CONSUMER_KEY;
const access_token = process.env.POCKET_ACCESS_TOKEN;

const args = {
    consumer_key: consumer_key,
    access_token: access_token,
    state: 'unread',
    tag: '_untagged_',
    sort: 'oldest',
    detailType: 'simple',
    count: 1,
    offset: 0,
};

export const get = async (loop = 3) => {
    const url = pocket_url + '/get';

    let last = 0;
    let offsets = [];

    while (loop-->0) {
        last += Math.floor(Math.random() * 100);
        offsets.push(last);
    }

    const calls = offsets.map((offset) => {
        return axios.post(
            url,
            Object.assign({}, args, {offset: offset})
        );
    });

    const responses = await Promise.all(calls);
    const output = responses.map((response) => {
        for (let item_id in response.data.list) {
            return response.data.list[item_id];
        }
    });

    return output;
}