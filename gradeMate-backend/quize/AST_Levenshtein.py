"""
AST and Levenshtein evaluation module for C++ code grading.

Calculates syntax AST tree similarity via Clang and string distance via
Levenshtein algorithm. Fallbacks gracefully if libclang is not installed.
"""

import os
import re
import logging
from Levenshtein import distance as levenshtein_distance

logger = logging.getLogger(__name__)

# Attempt to configure libclang library path dynamically
_CLANG_AVAILABLE = False
try:
    import clang.cindex
    custom_lib_path = os.environ.get('LIBCLANG_PATH', '')
    candidates = [
        custom_lib_path,
        "C:/Program Files/LLVM/bin/libclang.dll",
        "/usr/lib/llvm-14/lib/libclang.so",
        "/usr/lib/x86_64-linux-gnu/libclang.so",
        "/opt/homebrew/opt/llvm/lib/libclang.dylib",
    ]
    for path in candidates:
        if path and os.path.exists(path):
            try:
                clang.cindex.Config.set_library_file(path)
                _CLANG_AVAILABLE = True
                logger.info(f"Successfully loaded libclang from {path}")
                break
            except Exception as lib_err:
                logger.debug(f"Failed loading libclang from {path}: {lib_err}")
except Exception as import_err:
    logger.warning(f"Clang bindings not fully initialized: {import_err}")


def levenshtein_similarity(expected, detected):
    """
    Calculate normalized Levenshtein similarity percentage.

    :param expected: Reference string
    :param detected: Target string to compare
    :return: Float similarity score between 0.0 and 100.0
    """
    if not expected or not detected:
        return 0.0

    max_len = max(len(expected), len(detected))
    if max_len == 0:
        return 100.0

    dist = levenshtein_distance(expected, detected)
    base_similarity = 1.0 - (dist / max_len)

    # Scaled similarity range
    score = 30.0 + (base_similarity * 70.0)
    return max(0.0, min(100.0, score))


def fallback_token_ast(code):
    """
    Fallback structural AST tokenizer when libclang library is unavailable.

    Extracts C++ keywords, control structures, variables, and operators.
    :param code: Source code string
    :return: Tokenized structural representation string
    """
    tokens = re.findall(
        r'\b(?:include|int|float|double|char|void|if|else|for|while|return|'
        r'std|cout|cin|using|namespace|class|struct)\b|[{}();=><+\-*/]',
        code
    )
    return "\n".join(tokens)


def parse_cpp_code_ast(code):
    """
    Parse C++ code into an Abstract Syntax Tree (AST) string representation.

    Uses Clang if available, otherwise falls back to tokenized representation.
    :param code: Source C++ code string
    :return: Formatted AST structure string
    """
    if _CLANG_AVAILABLE:
        try:
            index = clang.cindex.Index.create()
            tu = index.parse(
                'tmp.cpp',
                args=['-std=c++17'],
                unsaved_files=[('tmp.cpp', code)],
                options=0
            )
            return _ast_to_string(tu.cursor)
        except Exception as err:
            logger.debug(f"Clang AST parsing error: {err}")

    return fallback_token_ast(code)


def _ast_to_string(node, level=0):
    """
    Recursively convert AST node hierarchy into a string format.

    :param node: Clang AST cursor node
    :param level: Indentation level
    :return: Text representation of AST tree
    """
    result = []
    for child in node.get_children():
        result.append("  " * level + child.kind.name)
        result.extend(_ast_to_string(child, level + 1))
    return "\n".join(result)


def evaluate_quiz(teacher_text, student_text):
    """
    Evaluate similarity between instructor solution and student submission.

    Computes text Levenshtein score and AST logic score.
    :param teacher_text: Reference solution text or list of strings
    :param student_text: Student submission text or list of strings
    :return: Tuple of (levenshtein_score, ast_score) bounded between 0 and 100
    """
    if isinstance(teacher_text, list):
        teacher_text = "\n".join(teacher_text)
    if isinstance(student_text, list):
        student_text = "\n".join(student_text)

    teacher_lines = [line.strip() for line in teacher_text.split("\n") if line.strip()]
    student_lines = [line.strip() for line in student_text.split("\n") if line.strip()]

    if not teacher_lines or not student_lines:
        return 0.0, 0.0

    ast_scores = []
    text_scores = []

    for t_line in teacher_lines:
        # Match each teacher line against best candidate student line
        best_text_sim = 0.0
        best_ast_sim = 0.0

        for s_line in student_lines:
            sim = levenshtein_similarity(t_line, s_line)
            if sim > best_text_sim:
                best_text_sim = sim

            if any(char in t_line for char in ['{', '}', ';', '(', ')']):
                try:
                    t_ast = parse_cpp_code_ast(t_line)
                    s_ast = parse_cpp_code_ast(s_line)
                    ast_sim = levenshtein_similarity(t_ast, s_ast)
                    if ast_sim > best_ast_sim:
                        best_ast_sim = ast_sim
                except Exception as err:
                    logger.debug(f"AST Line evaluation error: {err}")

        text_scores.append(best_text_sim)
        if best_ast_sim > 0:
            ast_scores.append(best_ast_sim)

    avg_text_score = sum(text_scores) / len(text_scores) if text_scores else 0.0
    avg_ast_score = sum(ast_scores) / len(ast_scores) if ast_scores else avg_text_score

    return min(100.0, avg_text_score), min(100.0, avg_ast_score)


def process_quiz(teacher_text, student_text, weights):
    """
    Process quiz evaluation with custom logic and similarity weights.

    :param teacher_text: Reference text
    :param student_text: Student text
    :param weights: Dict containing 'logic_weight' and 'similarity_threshold'
    :return: Dictionary containing evaluation results and calculated grade
    """
    lev_score, ast_score = evaluate_quiz(teacher_text, student_text)

    logic_weight = weights.get("logic_weight", 0.5)
    similarity_weight = weights.get("similarity_threshold", 0.5)

    total_weight = logic_weight + similarity_weight
    if total_weight > 0:
        final_score = (
            (lev_score * similarity_weight) + (ast_score * logic_weight)
        ) / total_weight
    else:
        final_score = (lev_score + ast_score) / 2.0

    final_score = min(100.0, max(0.0, final_score))

    if final_score >= 80:
        grade = "A"
    elif final_score >= 70:
        grade = "B"
    elif final_score >= 60:
        grade = "C"
    elif final_score >= 50:
        grade = "D"
    else:
        grade = "F"

    return {
        "levenshtein_score": round(lev_score, 2),
        "ast_score": round(ast_score, 2),
        "final_score": round(final_score, 2),
        "grade": grade
    }
