import spacy
from spacy.language import Language
from spacy.matcher import DependencyMatcher
from spacy.tokens import Span, SpanGroup

methods = {
    "opinion_v0": {
        "version": "opinion_v0",
        "pattern": [
            {
                "RIGHT_ID": "OPINION_OPR_found_root",
                "RIGHT_ATTRS": {
                    "TAG": {
                        "IN": ["VE"]
                    }
                }
            },
            {
                "LEFT_ID": "OPINION_OPR_found_root",
                "REL_OP": ">",
                "RIGHT_ID": "OPINION_SRC_found_root",
                "RIGHT_ATTRS": {
                    "DEP": {
                        "IN": ["nsubj"]
                    }
                }
            },
            {
                "LEFT_ID": "OPINION_OPR_found_root",
                "REL_OP": ">",
                "RIGHT_ID": "OPINION_SEG_found_root",
                "RIGHT_ATTRS": {
                    "DEP": {
                        "IN": ["ccomp"]
                    },
                }
            }
        ]
    },
}

@Language.factory("opinion_matcher")
def opinion_matcher(nlp, name, version, pattern):
    def on_match(matcher, doc, id, matches):
        # print('Matched!', matches, 'id', id, 'matcher', matcher)
        pass

    dependency_matcher = DependencyMatcher(nlp.vocab, validate=True)
    dependency_matcher.add(f"{version}", [pattern], on_match=on_match)
    
    def opinion_matcher_component(doc):
        matches = dependency_matcher(doc)
        opinion_spangroup = []
        
        for match_index, (_, match_token_id_list) in enumerate(matches):
            OPINION_SRC_root_token = doc[match_token_id_list[1]]
            OPINION_SEG_root_token = doc[match_token_id_list[2]]

            OPINION_SRC_subtree_tokens = [token for token in OPINION_SRC_root_token.subtree]
            OPINION_SEG_subtree_tokens = [token for token in OPINION_SEG_root_token.subtree]

            OPINION_SRC_span = Span(doc, OPINION_SRC_subtree_tokens[0].i, OPINION_SRC_subtree_tokens[-1].i + 1, label="OPINION_SRC_found")
            OPINION_SEG_span = Span(doc, OPINION_SEG_subtree_tokens[0].i, OPINION_SEG_subtree_tokens[-1].i + 1, label="OPINION_SEG_found")
            OPINION_OPR_span = Span(doc, match_token_id_list[0], match_token_id_list[0] + 1, label="OPINION_OPR_found")

            for token in OPINION_SRC_span:
                token._.found_type = "OPINION_SRC_found"
            for token in OPINION_SEG_span:
                token._.found_type = "OPINION_SEG_found"
            for token in OPINION_OPR_span:
                token._.found_type = "OPINION_OPR_found"

            opinion_spangroup.append([OPINION_SRC_span, OPINION_OPR_span, OPINION_SEG_span])

        nonoverlap_opinion_spangroup = []
        index = 0
        
        if len(opinion_spangroup) > 0:
            for i in range(len(opinion_spangroup) - 1):
                if SpanGroup(doc, spans=opinion_spangroup[i] + opinion_spangroup[i + 1]).has_overlap:
                    opinion_spangroup[i + 1] = spacy.util.filter_spans(opinion_spangroup[i] + opinion_spangroup[i + 1])
                else:
                    doc.spans[f"opinion_found{index}"] = opinion_spangroup[i] 
                    index += 1
                    nonoverlap_opinion_spangroup.extend(opinion_spangroup[i])
            
            doc.spans[f"opinion_found[{index}]"] = opinion_spangroup[-1] 
            nonoverlap_opinion_spangroup.extend(opinion_spangroup[-1]) 
        
        doc.spans["opinion_found"] = nonoverlap_opinion_spangroup
        return doc

    return opinion_matcher_component