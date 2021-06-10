import { CronJob } from 'quirrel/next';

export default CronJob('api/monthly-mail', '0 0 1 * *', async () => {
  //TODO: Get user list from airtable
  const freelancers = [{ name: 'David', email: 'david@davidlevai.com' }];
  await Promise.all(
    freelancers.map(async (freelancer) => {
      //TODO: Send email with Postmark to freelancer.email
    })
  );
});
