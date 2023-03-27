import spacy
from spacy.language import Language
import torch
from ckip_transformers.nlp import CkipPosTagger, CkipNerChunker


has_gpu = True if torch.cuda.is_available() else False

@Language.component('ckip_ner')
def ckip_ner(doc):
    ner_driver = CkipNerChunker(model="bert-base", device=0 if has_gpu else -1)
    ner_result = ner_driver([str(doc)], show_progress=False)#   ner_result is List[List[]]
    NerToken_spans = []
    for NerToken in ner_result[0]:
        NerToken_span = doc.char_span(NerToken.idx[0], NerToken.idx[1], label=NerToken.ner, alignment_mode='expand')
        NerToken_spans.append(NerToken_span)
    doc.spans["ckip_ner"] = NerToken_spans
    NerToken_spans = spacy.util.filter_spans(NerToken_spans)
    doc.set_ents(NerToken_spans)
    return doc

@Language.component('ckip_pos')
def ckip_pos(doc):
    pos_driver = CkipPosTagger(model="bert-base", device=0 if has_gpu else -1)
    tokens = [token.text for token in doc]
    pos_result = pos_driver([tokens], show_progress=False)#   pos_result is List[List[]]
    for token, ckip_pos_tag in zip(doc, pos_result[0]):
        token.tag_ = ckip_pos_tag
    return doc

@Language.component('ckip_ner_aws')
def ckip_ner_aws(doc):
    CkipNerChunker(model="bert-base",
                                )
    ner_driver = CkipNerChunker(model="bert-base",
                                device=0 if has_gpu else -1,
                                model_name="/tmp/bert_model/bert-base-chinese-ner",
                                tokenizer_name="/tmp/bert_model/bert-base-chinese")
    
    ner_result = ner_driver([str(doc)], show_progress=False)#   ner_result is List[List[]]
    NerToken_spans = []
    for NerToken in ner_result[0]:
        NerToken_span = doc.char_span(NerToken.idx[0], NerToken.idx[1], label=NerToken.ner, alignment_mode='expand')
        NerToken_spans.append(NerToken_span)
    doc.spans["ckip_ner"] = NerToken_spans
    NerToken_spans = spacy.util.filter_spans(NerToken_spans)
    doc.set_ents(NerToken_spans)
    return doc

@Language.component('ckip_pos_aws')
def ckip_pos_aws(doc):
    pos_driver = CkipPosTagger(model="bert-base",
                               device=0 if has_gpu else -1,
                               model_name="/tmp/bert_model/bert-base-chinese-pos",
                               tokenizer_name="/tmp/bert_model/bert-base-chinese")
    
    tokens = [token.text for token in doc]
    pos_result = pos_driver([tokens], show_progress=False)#   pos_result is List[List[]]
    for token, ckip_pos_tag in zip(doc, pos_result[0]):
        token.tag_ = ckip_pos_tag
    return doc