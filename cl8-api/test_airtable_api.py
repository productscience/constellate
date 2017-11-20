import pytest
from airtable_api import ConstellateAirtable


@pytest.fixture
def peeps_response():
    return [
        {
            'id': 'rec0CSbkZBm1wWluF',
            'fields': {
                'Name': "Homer Simpson",
                'Tags': ['recX3R1fGKK4dF28K', 'reccxuSBDaC2D33RC'],
                'email': 'homer.simpson@yahoo.com'},
            'createdTime': '2017-11-11T12:40:59.000Z'
        },
        {
            'id': 'rec0tJpLlYD0U2Yyh',
            'fields': {
                'Name': 'Apu',
                'email': 'apu@gmail.com'},
            'createdTime': '2017-11-11T12:38:10.000Z'
        }
    ]


@pytest.fixture
def tags_response():
    return [
        {
            'createdTime': '2017-10-19T12:45:25.000Z',
            'fields': {
                'Name': 'government', 'Table 1': ['rec9zRtYSMEj8CoJk']
            },
            'id': 'reccxuSBDaC2D33RC'
        },
        {
            'createdTime': '2017-10-19T12:50:00.000Z',
            'fields': {

                'Name': 'architecture', 'Table 1': ['recoOFQkHeQo8mqgv']
            },
            'id': 'recX3R1fGKK4dF28K'
        }]

# @pytest.mark.pending
def test_enriched_list_of_peeps_returned(peeps_response, tags_response):
    cl8_airtable = ConstellateAirtable()
    assert len(peeps_response) > 0
    assert len(tags_response) > 0

    taggo = {t['id']: t['fields']['Name'] for t in tags_response}

    enriched_peeps = cl8_airtable.enrich_peeps_with_tags(
        peeps_response, taggo)

    assert len(enriched_peeps) == len(peeps_response)


def test_enriches_a_peeps_tags(peeps_response, tags_response):
    peep = peeps_response[0]
    cl8_airtable = ConstellateAirtable()
    taggo = {t['id']: t['fields']['Name'] for t in tags_response}
    enriched_peep = cl8_airtable.enrich_peep_with_tags(peep, taggo)

    assert len(enriched_peep['fields']['Tags']) == 2
    assert 'id' in enriched_peep['fields']['Tags'][0].keys()
    assert 'Name' in enriched_peep['fields']['Tags'][0].keys()
    assert enriched_peep['fields']['Tags'][0]['id'] == "recX3R1fGKK4dF28K"
    assert enriched_peep['fields']['Tags'][0]['Name'] == "architecture"

# @pytest.mark.skip
def test_enriches_a_peeps_tags():
    from os import environ as env
    from dotenv import load_dotenv, find_dotenv
    ENV_FILE = find_dotenv()
    if ENV_FILE:
        load_dotenv(ENV_FILE)

    cl8_airtable = ConstellateAirtable(
        api_key=env.get('AIRTABLE_API_KEY'),
        base=env.get('AIRTABLE_BASE')
    )
    payload = cl8_airtable.fetch_enriched_peeps_payload()
