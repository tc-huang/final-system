import spacy
from spacy.language import Language
import torch
from ckip_transformers.nlp import CkipPosTagger, CkipNerChunker
import os
from transformers import BertTokenizerFast, AutoModelForTokenClassification


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
    if not os.path.exists('/tmp/model'):
        os.mkdir('/tmp/model')
    
    if not os.path.exists('/tmp/model/bert-base-chinese'):
        os.mkdir('/tmp/model/bert-base-chinese')

    if not os.path.exists('/tmp/model/bert-base-chinese-ner'):
        os.mkdir('/tmp/model/bert-base-chinese-ner')
        model = AutoModelForTokenClassification.from_pretrained('ckiplab/bert-base-chinese-ner', cache_dir='/tmp/model/ckiplab/bert-base-chinese-ner')
        model.save_pretrained('/tmp/model/ckiplab/bert-base-chinese-ner')
        del model

    ner_driver = CkipNerChunker(model="bert-base",
                            device=0 if has_gpu else -1,
                            model_name="/tmp/model/ckiplab/bert-base-chinese-ner",
                            tokenizer_name="/tmp/model/bert-base-chinese")
    
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
    if not os.path.exists('/tmp/model'):
        os.mkdir('/tmp/model')

    if not os.path.exists('/tmp/model/bert-base-chinese'):
        os.mkdir('/tmp/model/bert-base-chinese')
    
    if not os.path.exists('/tmp/model/bert-base-chinese-pos'):
        os.mkdir('/tmp/model/bert-base-chinese-pos')
    
    tokenizer = BertTokenizerFast.from_pretrained('bert-base-chinese', cache_dir='/tmp/model/bert-base-chinese')
    tokenizer.save_pretrained('/tmp/model/bert-base-chinese')
    del tokenizer

    model = AutoModelForTokenClassification.from_pretrained('ckiplab/bert-base-chinese-pos', cache_dir='/tmp/model/ckiplab/bert-base-chinese-pos')
    model.save_pretrained('/tmp/model/ckiplab/bert-base-chinese-pos')
    del model

    pos_driver = CkipPosTagger(model="bert-base",
                               device=0 if has_gpu else -1,
                               model_name="/tmp/model/ckiplab/bert-base-chinese-pos",
                               tokenizer_name="/tmp/model/bert-base-chinese")
    
    tokens = [token.text for token in doc]
    pos_result = pos_driver([tokens], show_progress=False)#   pos_result is List[List[]]
    for token, ckip_pos_tag in zip(doc, pos_result[0]):
        token.tag_ = ckip_pos_tag
    return doc