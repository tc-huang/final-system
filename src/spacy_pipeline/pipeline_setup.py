from spacy.tokens import Token, Span, Doc
import spacy_stanza
import torch
from .ckip import ckip_ner, ckip_pos

has_gpu = True if torch.cuda.is_available() else False

def set_all_extensions():
    Token.set_extension('label_id', default=[], force=True)
    Token.set_extension('label_type', default=[], force=True)
    Token.set_extension('relation_label', default=[], force=True)

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

def get_vocab():
    spacy_pipeline = spacy_stanza.load_pipeline("xx", lang='zh-hant', use_gpu=has_gpu)
    return spacy_pipeline.vocab