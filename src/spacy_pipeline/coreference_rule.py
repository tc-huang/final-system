import spacy.language as language


@Language.factory("pronounce_matcher_label")
def pronounce_matcher(nlp, name, target_spangroup_key, target_span_label, new_spangroup_key):
    def prnoun_match_rule(span):
        if all(target_span_label in token._.label_type for token in span):
            if len(span) == 1:
                token = span[0]
                if len(token) == 1:
                    if token.pos_ == "PRON":
                        return True # 他
                    elif token.pos_ == "PROPN":
                        return True # 張
                # else:
                #     if token.pos_ == "NOUN":
                #         return True # 官員 總統
            
            elif len(span) == 2:
                token1, token2 = span[0], span[1]
                if len(token1) == 1 and len(token2) == 2:
                    if token1.pos_ == "PROPN" and token2.pos_ == "NOUN":
                        return True # 蔡總統 盧市長
                
                # if token1.pos_ == "NOUN" and token2.pos_ == "NOUN":
                #     return True # 媽媽市長 縣黨部
            
            elif len(span) == 3:
                token1, token2, token3 = span[0], span[1], span[2]
                if len(token1) == 1 and len(token2) == 1 and len(token3) == 2:
                    if token1.pos_ == "PROPN" and token2.pos_ == "PART" and token3.pos_ == "NOUN":
                        return True # 賴副總統
            
            if len(span) >= 2:
                if span[0].pos_ == "DET" and all(["NOUN" in token.pos_ for token in span[1:]]):
                    return True # 該綠營人士 這名黨政人士 該人士 該立委
                
                elif span[0].pos_ == "NUM" and all(["NOUN" in token.pos_ for token in span[1:]]):
                    return True # 3位監委 2位監委

        return False
    def pronounce_matcher_component(doc):
        if target_spangroup_key in doc.spans:
            for span in doc.spans[target_spangroup_key]:
                if span.label_ == target_span_label:
                    if prnoun_match_rule(span):
                        if new_spangroup_key in doc.spans:
                            doc.spans[new_spangroup_key].append(span)
                        else:
                            doc.spans[new_spangroup_key] = [span] 
        return doc
    return pronounce_matcher_component

@Language.factory("pronounce_matcher_found")
def pronounce_matcher(nlp, name, target_spangroup_key, target_span_label, new_spangroup_key):
    def prnoun_match_rule(span):
        if all(target_span_label in token._.label_type for token in span):
            if len(span) == 1:
                token = span[0]
                if len(token) == 1:
                    if token.pos_ == "PRON":
                        return True # 他
                    elif token.pos_ == "PROPN":
                        return True # 張
                # else:
                #     if token.pos_ == "NOUN":
                #         return True # 官員 總統
            
            elif len(span) == 2:
                token1, token2 = span[0], span[1]
                if len(token1) == 1 and len(token2) == 2:
                    if token1.pos_ == "PROPN" and token2.pos_ == "NOUN":
                        return True # 蔡總統 盧市長
                
                # if token1.pos_ == "NOUN" and token2.pos_ == "NOUN":
                #     return True # 媽媽市長 縣黨部
            
            elif len(span) == 3:
                token1, token2, token3 = span[0], span[1], span[2]
                if len(token1) == 1 and len(token2) == 1 and len(token3) == 2:
                    if token1.pos_ == "PROPN" and token2.pos_ == "PART" and token3.pos_ == "NOUN":
                        return True # 賴副總統
            
            if len(span) >= 2:
                if span[0].pos_ == "DET" and all(["NOUN" in token.pos_ for token in span[1:]]):
                    return True # 該綠營人士 這名黨政人士 該人士 該立委
                
                elif span[0].pos_ == "NUM" and all(["NOUN" in token.pos_ for token in span[1:]]):
                    return True # 3位監委 2位監委

        return False
    
    def pronounce_matcher_component(doc):
        if target_spangroup_key in doc.spans:
            for span in doc.spans[target_spangroup_key]:
                if span.label_ == target_span_label:
                    if prnoun_match_rule(span):
                        if new_spangroup_key in doc.spans:
                            doc.spans[new_spangroup_key].append(span)
                        else:
                            doc.spans[new_spangroup_key] = [span] 
        return doc
    return pronounce_matcher_component