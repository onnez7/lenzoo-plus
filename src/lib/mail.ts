import { Resend } from 'resend';
import * as React from 'react';

interface SendEmailProps {
    apiKey: string;
    from: string;
    to: string | string[];
    subject: string;
    react: React.ReactElement;
}

export const sendEmail = async ({ apiKey, from, to, subject, react }: SendEmailProps) => {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
        from: from,
        to: to,
        subject: subject,
        react: react,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};