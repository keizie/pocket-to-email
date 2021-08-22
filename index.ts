import * as pocket from './pocket';
import * as mailchimp from './mailchimp';

export const event = (event, callback) => {
  callback();
};

export const helloWorld = async (req, res) => {
    const data = await pocket.get(3);
    const content = data.map((item) => {
        return (item.resolved_title ? item.resolved_title : item.given_title)
            + '\n' + (item.resolved_url ? item.resolved_url : item.given_url)
            + '\n' + ' * https://app.getpocket.com/read/' + item.item_id
            + (item.listen_duration_estimate > 0 ? ' , ' + item.listen_duration_estimate : '')
            + '\n' + ' * http://web.archive.org/'
            + (item.resolved_url ? item.resolved_url : item.given_url)
            + '\n' + (typeof item.excerpt != 'undefined' ? item.excerpt + '\n': '')
        ;
    }).join('\n\n');
    await mailchimp.send(content);

    const output = data.map((item) => {
        return (item.resolved_url ? item.resolved_url : item.given_url)
            + '\n' + JSON.stringify(item, null, 4)
        ;
    });

    res.status(200).type('text/plain').send(output.join('\n\n'));
};