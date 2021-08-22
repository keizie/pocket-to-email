import axios from 'axios';

const mailchimp_url = 'https://us20.api.mailchimp.com/3.0';

const mailchimp_username = process.env.MAILCHIMP_USERNAME;
const api_key = process.env.MAILCHIMP_API_KEY;
const basic_auth = {
    auth: {
        username: mailchimp_username,
        password: api_key,
    }
};

const audience_lists = async () => {
    const url = mailchimp_url + '/lists';

    try {
        const response = await axios.get(
            url,
            Object.assign(
                {
                    params: {
                        fields: 'lists.id',
                        count: 1,
                    }
                },
                basic_auth
            )
        );
        return response.data.lists.map((list) => {
            return list.id;
        });
    } catch (ex) {
        console.error(ex);
    }
}

const campaign_create = async (list_id) => {
    const url = mailchimp_url + '/campaigns';

    try {
        const response = await axios.post(
            url,
            {
                type: 'plaintext',
                recipients: {
                    list_id: list_id,
                },
                settings: {
                    subject_line: new Date().toLocaleString(),
                    from_name: 'you know what',
                    reply_to: process.env.MAILCHIMP_REPLY_TO,
                    auto_footer: false,
                },
                tracking: {
                    opens: false,
                    html_clicks: false,
                    text_clicks: false,
                    goal_tracking: false,
                    ecomm360: false,
                    //google_analytics: false,
                    //clicktale: false,
                    //salesforce: false,
                    //capsule: false,
                }
            },
            basic_auth
        );
        return response.data.id;
    } catch (ex) {
        console.error(ex);
        if (ex.response.data.status != 200) {
            console.warn(ex.response.data.errors);
        }
    }
}

const campaign_set_content = async (campaign_id, plain_text) => {
    if (typeof campaign_id !== 'string') {
        return false;
    }

    const url = mailchimp_url + '/campaigns/' + campaign_id + '/content';

    try {
        await axios.put(
            url,
            {
                plain_text: plain_text,
            },
            basic_auth
        );
        return true;
    } catch (ex) {
        console.error(ex);
        return false;
    }
}

const campaign_send = async (campaign_id) => {
    if (typeof campaign_id !== 'string') {
        return false;
    }

    const url = mailchimp_url + '/campaigns/' + campaign_id + '/actions/send';

    try {
        await axios.post(
            url,
            {
                test_emails: [
                    process.env.MAILCHIMP_TEST_RECEIVER,
                ],
                send_type: 'plaintext',
            },
            basic_auth
        );
        return true;
    } catch (ex) {
        console.error(ex);
        return false;
    }
}

const campaign_list_sent = async () => {
    const url = mailchimp_url + '/campaigns';

    try {
        const response = await axios.get(
            url,
            Object.assign(
                {
                    params: {
                        fields: 'campaigns.id',
                        status: 'sent',
                    }
                },
                basic_auth
            )
        );
        return response.data.campaigns.map((campaign) => {
            return campaign.id;
        });
    } catch (ex) {
        console.error(ex);
    }
}

const campaign_delete = async (campaign_id) => {
    const url = mailchimp_url + '/campaigns/' + campaign_id;

    try {
        await axios.delete(
            url,
            basic_auth
        );
    } catch (ex) {
        console.error(ex);
    }
}

export const send = async (content) => {
    const list_ids = await audience_lists();
    const list_id = list_ids.shift();

    const campaign_id = await campaign_create(list_id);
    await campaign_set_content(campaign_id, content);
    await campaign_send(campaign_id);

    const campaign_ids = await campaign_list_sent();
    campaign_ids.forEach((camapgin_id) => {
        campaign_delete(camapgin_id);
    });

    return campaign_id;
}