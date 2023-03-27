from spacy.tokens import Token, Span, Doc
import spacy_stanza
import torch
import stanza

from .ckip import ckip_ner, ckip_pos, ckip_ner_aws, ckip_pos_aws
from .opinion_rule import opinion_matcher

has_gpu = True if torch.cuda.is_available() else False

def set_all_extensions():
    Token.set_extension('label_id', default=[], force=True)
    Token.set_extension('label_type', default=[], force=True)
    Token.set_extension('relation_label', default=[], force=True)
    Token.set_extension('found_type', default=None, force=True)

    Span.set_extension('label_id', default=[], force=True)
    Span.set_extension('label_type', default=[], force=True)
    Span.set_extension('relation_label', default=[], force=True)

    Doc.set_extension('news_uid', default=None, force=True)
    Doc.set_extension('news_title', default=None, force=True)
    Doc.set_extension('news_url', default=None, force=True)
    Doc.set_extension('paragraph_index', default=None, force=True)


def error_handler(proc_name, proc, docs, e):
    print(f"An error occurred when applying component {proc_name}.")
    print(f"Docs: {docs}")
    print(f"Proc: {proc}")
    print(f"Error: {e}")
    print()


def get_pipeline():
    set_all_extensions()
    spacy_pipeline = spacy_stanza.load_pipeline("xx", lang='zh-hant', use_gpu=has_gpu)
    spacy_pipeline.add_pipe('ckip_pos', last=True)
    spacy_pipeline.add_pipe('ckip_ner', last=True)
    spacy_pipeline.set_error_handler(error_handler)
    print(spacy_pipeline.pipe_names)
    analysis = spacy_pipeline.analyze_pipes(pretty=True)
    print(analysis)
    return spacy_pipeline

def get_opinion_pipeline(rule_version_and_pattenrn:dict):
    set_all_extensions()
    spacy_pipeline = spacy_stanza.load_pipeline("xx", lang='zh-hant', use_gpu=has_gpu)
    spacy_pipeline.add_pipe("opinion_matcher",
                        config={
                            "version": rule_version_and_pattenrn["version"],
                            "pattern":rule_version_and_pattenrn["pattern"]
                            },
                        last=True)
    spacy_pipeline.set_error_handler(error_handler)
    print(spacy_pipeline.pipe_names)
    analysis = spacy_pipeline.analyze_pipes(pretty=True)
    print(analysis)
    return spacy_pipeline

def get_coreference_pipeline():
    pass
    # spacy_pipeline = spacy_stanza.load_pipeline("xx", lang='zh-hant', use_gpu=has_gpu)
    # spacy_pipeline.add_pipe("pronounce_matcher_label", config={"target_spangroup_key": "opinion_label", "target_span_label": "OPINION_SRC", "new_spangroup_key": "pronounce_in_label"}, last=True)
    # spacy_pipeline.add_pipe("pronounce_matcher_found", config={"target_spangroup_key": "opinion_found", "target_span_label": "OPINION_SRC_match", "new_spangroup_key": "pronounce_in_found"}, last=True)

def get_vocab():
    spacy_pipeline = spacy_stanza.load_pipeline("xx", lang='zh-hant', use_gpu=has_gpu)
    return spacy_pipeline.vocab

def get_aws_pipeline():
    rule_version_and_pattern = {
        "version": "opinion_v0",
        "pattern": [
            {
                "RIGHT_ID": "OPINION_OPR_found_root",
                "RIGHT_ATTRS": {
                    "TAG": {
                        "IN": ["VE"]
                    },
                }
            },
            {
                "LEFT_ID": "OPINION_OPR_found_root",
                "REL_OP": ">",
                "RIGHT_ID": "OPINION_SRC_found_root",
                "RIGHT_ATTRS": {
                    "DEP": {
                        "IN": ["nsubj"]
                    },
                }
            },
            {
                "LEFT_ID": "OPINION_OPR_found_root",
                "REL_OP": ">",
                "RIGHT_ID": "OPINION_SEG_found_root",
                "RIGHT_ATTRS": {
                    "DEP": {
                        "IN": ["ccomp", "parataxis"]
                    },
                    "POS": {
                            "IN": ["VERB", "NOUN", "ADJ"]
                    }
                }
            }
        ]
    }
    # stanza.download(lang='zh-hant', model_dir='/tmp/stanza_resources')
    set_all_extensions()
    spacy_pipeline = spacy_stanza.load_pipeline("xx", lang='zh-hant', dir='/tmp/stanza_resources', download_method=None, use_gpu=has_gpu)
    spacy_pipeline.add_pipe('ckip_pos_aws', last=True)
    spacy_pipeline.add_pipe('ckip_ner_aws', last=True)
    spacy_pipeline.add_pipe("opinion_matcher",
                        config={
                            "version": rule_version_and_pattern["version"],
                            "pattern":rule_version_and_pattern["pattern"]
                            },
                        last=True)
    spacy_pipeline.set_error_handler(error_handler)
    print(spacy_pipeline.pipe_names)
    analysis = spacy_pipeline.analyze_pipes(pretty=True)
    print(analysis)
    return spacy_pipeline