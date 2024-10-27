use mf2_parser::ast;
use mf2_parser::Span;
use mf2_parser::Spanned;
use mf2_parser::Visit;
use mf2_parser::Visitable;
use serde::Serialize;
use wasm_bindgen::prelude::wasm_bindgen;

#[derive(Serialize)]
struct HighlightToken {
  start: u32,
  end: u32,
  label: TokenLabel,
  #[serde(skip_serializing_if = "Option::is_none")]
  diagnostic: Option<String>,
}

#[derive(Clone, Copy, Serialize)]
#[serde(rename_all = "camelCase")]
enum TokenLabel {
  Number,
  String,
  Escape,
  Variable,
  Function,
  Attribute,
  Tag,
  Keyword,

  Error,

  Brackets1,
  Brackets2,
  Brackets3,
}

const MATCHING_BRACKETS_LABELS: [TokenLabel; 3] = [
  TokenLabel::Brackets1,
  TokenLabel::Brackets2,
  TokenLabel::Brackets3,
];

#[wasm_bindgen]
pub fn highlight(code: &str) -> wasm_bindgen::JsValue {
  let (ast, mut diagnostics, info) = mf2_parser::parse(code);
  mf2_parser::analyze_semantics(&ast, &mut diagnostics);

  struct TokenVisitor<'a> {
    info: mf2_parser::SourceTextInfo<'a>,
    brace_depth: usize,
    tokens: Vec<HighlightToken>,
  }

  impl TokenVisitor<'_> {
    fn add_token_with_diagnostic(
      &mut self,
      span: Span,
      label: TokenLabel,
      diagnostic: Option<String>,
    ) {
      let start = self
        .info
        .utf16_len(Span::new(self.info.span().start..span.start));
      let end = start + self.info.utf16_len(span);
      self.tokens.push(HighlightToken {
        start,
        end,
        label,
        diagnostic,
      });
    }

    fn add_token(&mut self, span: Span, label: TokenLabel) {
      self.add_token_with_diagnostic(span, label, None);
    }
  }

  impl<'ast, 'text> Visit<'ast, 'text> for TokenVisitor<'text> {
    fn visit_number(&mut self, node: &'ast ast::Number<'text>) {
      self.add_token(node.span(), TokenLabel::Number);
      node.apply_visitor_to_children(self);
    }

    fn visit_quoted(&mut self, node: &'ast ast::Quoted<'text>) {
      self.add_token(node.span(), TokenLabel::String);
      node.apply_visitor_to_children(self);
    }

    fn visit_escape(&mut self, node: &'ast ast::Escape) {
      self.add_token(node.span(), TokenLabel::Escape);
      node.apply_visitor_to_children(self);
    }

    fn visit_variable(&mut self, node: &'ast ast::Variable<'text>) {
      self.add_token(node.span(), TokenLabel::Variable);
      node.apply_visitor_to_children(self);
    }

    fn visit_literal(&mut self, node: &'ast ast::Literal<'text>) {
      match node {
        ast::Literal::Text(s) => self.add_token(s.span(), TokenLabel::String),
        _ => {}
      }
      node.apply_visitor_to_children(self);
    }

    fn visit_function(&mut self, node: &'ast ast::Function<'text>) {
      self.add_token(
        Span::new(node.start..node.id.span().end),
        TokenLabel::Function,
      );
      node.apply_visitor_to_children(self);
    }

    fn visit_attribute(&mut self, node: &'ast ast::Attribute<'text>) {
      self.add_token(node.key.span(), TokenLabel::Attribute);
      node.apply_visitor_to_children(self);
    }

    fn visit_markup(&mut self, node: &'ast ast::Markup<'text>) {
      self.add_token(node.id.span(), TokenLabel::Tag);
      node.apply_visitor_to_children(self);
    }

    fn visit_local_declaration(
      &mut self,
      node: &'ast ast::LocalDeclaration<'text>,
    ) {
      self.add_token(
        Span::new(node.start..node.start + ".local"),
        TokenLabel::Keyword,
      );
      node.apply_visitor_to_children(self);
    }

    fn visit_input_declaration(
      &mut self,
      node: &'ast ast::InputDeclaration<'text>,
    ) {
      self.add_token(
        Span::new(node.start..node.start + ".input"),
        TokenLabel::Keyword,
      );
      node.apply_visitor_to_children(self);
    }

    fn visit_matcher(&mut self, node: &'ast ast::Matcher<'text>) {
      self.add_token(
        Span::new(node.start..node.start + ".match"),
        TokenLabel::Keyword,
      );
      let text = self.info.text(node.span());
      if text.starts_with("{") && text.ends_with("}") {
        let label = MATCHING_BRACKETS_LABELS
          [self.brace_depth % MATCHING_BRACKETS_LABELS.len()];
        self.add_token(Span::new(node.start..node.start + '{'), label);

        self.brace_depth += 1;
        node.apply_visitor_to_children(self);
        self.brace_depth -= 1;

        let text = self.info.text(node.span());
        self.add_token(
          Span::new((node.start + &text[0..text.len() - 1])..node.span().end),
          label,
        );
      } else {
        node.apply_visitor_to_children(self);
      }
    }

    fn visit_expression(&mut self, node: &'ast ast::Expression<'text>) {
      let span = node.span();
      let text = self.info.text(span);
      if text.starts_with("{") && text.ends_with("}") {
        let label = MATCHING_BRACKETS_LABELS
          [self.brace_depth % MATCHING_BRACKETS_LABELS.len()];

        self.add_token(Span::new(span.start..span.start + '{'), label);

        self.brace_depth += 1;
        node.apply_visitor_to_children(self);
        self.brace_depth -= 1;

        let text = self.info.text(span);
        self.add_token(
          Span::new((span.start + &text[0..text.len() - 1])..span.end),
          label,
        );
      } else {
        node.apply_visitor_to_children(self);
      }
    }

    fn visit_quoted_pattern(&mut self, node: &'ast ast::QuotedPattern<'text>) {
      let span = node.span();
      let text = self.info.text(span);
      if text.starts_with("{{") && text.ends_with("}}") {
        let label = MATCHING_BRACKETS_LABELS
          [self.brace_depth % MATCHING_BRACKETS_LABELS.len()];
        self.add_token(Span::new(span.start..span.start + "{{"), label);

        self.brace_depth += 1;
        node.apply_visitor_to_children(self);
        self.brace_depth -= 1;

        let text = self.info.text(span);
        self.add_token(
          Span::new((span.start + &text[0..text.len() - 2])..span.end),
          label,
        );
      } else {
        node.apply_visitor_to_children(self);
      }
      node.apply_visitor_to_children(self);
    }
  }

  let mut visitor = TokenVisitor {
    info,
    brace_depth: 0,
    tokens: Vec::new(),
  };
  ast.apply_visitor(&mut visitor);
  for diagnostic in diagnostics {
    let span = diagnostic.span();
    visitor.add_token_with_diagnostic(
      span,
      TokenLabel::Error,
      Some(diagnostic.message()),
    );
  }
  serde_wasm_bindgen::to_value(&visitor.tokens).unwrap()
}
