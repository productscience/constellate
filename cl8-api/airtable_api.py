# require the airtable api and constants
import airtable as atbl

# make both queries
from os import environ as env

from dotenv import load_dotenv, find_dotenv
ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

class ConstellateAirtable():
    """
    Wraps the airtable API lets us fetch data, make updates and return it in an
    convenient data structure
    """

    def __init__(self, api_key=None, base=None):
        if api_key is None:
            self.api_key = env.get('AIRTABLE_API_KEY')
        else:
            self.api_key = api_key

        if base is None:
            self.base = env.get('AIRTABLE_BASE')
        else:
            self.base = base

        self.tag_list = {}

    def fetch_peeps(self):
        peeps = atbl.Airtable(self.base, 'Peeps', api_key=self.api_key)
        return peeps.get_all()

    def fetch_tags(self):
        tags = atbl.Airtable(self.base, 'Tags', api_key=self.api_key)
        returned_tags = tags.get_all()
        self.tag_list = { t['id']: t['fields']['Name'] for t in returned_tags }
        return returned_tags

    def enrich_peeps_with_tags(self, peeps, tags):
        """
        Return a list of peeps where each peep's set of tags has the
        human friendly version as well as just the id from airtable.

        Each peep looks like this:

        {
          'createdTime': '2017-11-11T12:38:10.000Z',
          'fields': {
             'Name': 'Chris Adams',
             'Tags': [
                 {'recvyDsYcNdJx91is', 'human-friendly-name'}
                 {'rec8AoQ0MPMJQxYKK', 'human-friendly-name'}
             ],
             'email': 'chris@productscience.co.uk'
          },
        }

        """
        # [(t['fields']['Name'], t['id']) for t in tags]
        return [self.enrich_peep_with_tags(peep, tags) for peep in peeps]

    def enrich_peep_with_tags(self, peep, tags):

        # copy all the fields first
        enriched_peep = peep
        # import ipdb;ipdb.set_trace()

        if "Tags" in enriched_peep['fields']:
            prev_tags = enriched_peep['fields']['Tags']
            enriched_tags = []
            for tag in prev_tags:
                enriched_tags.append({
                    'id': tag,
                    'Name': tags[tag]
                })

            enriched_peep['fields']['Tags'] = enriched_tags

        return enriched_peep

    def fetch_enriched_peeps_payload(self):
        """
        """
        peeps = self.fetch_peeps()
        tags = self.fetch_tags()
        return self.enrich_peeps_with_tags(peeps, self.tag_list)


    def update_peep(self, peep_id, payload):
        """
        find the corresponding peep, and update all the relevant fields,
        also updating the tags if need be
        """

        # check if there are new tags, and update those, then
        # hit the peeps API

        pass

    def update_tag(self, peep_id, payload):
        """
        find the corresponding tag, and update all the relevant tags
        """
        pass
