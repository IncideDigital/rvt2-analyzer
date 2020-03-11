<template>
  <div>
    <template
      v-if="queryType === 'query_string' || queryType === 'query_string_hl'"
    >
      <em>Queries</em> use
      <a href="https://lucene.apache.org/core/2_9_4/queryparsersyntax.html"
        >Lucene syntax</a
      >. The "_hl" variant also includes highlighting (use with care,
      intensive).
      <ul>
        <li>
          <code>*</code> returns all documents. Useful to know the size of the
          index.
        </li>
        <li>
          <code>dog cat</code> is equivalent to <code>dog OR cat</code>. This
          query searches for documents including either <em>dog</em> or
          <em>cat</em> or both terms.
        </li>
        <li>
          <code>dog cat^4</code> searches for documents including any of these
          terms, but gives preference to <em>cat</em> when the relevance is
          calculated.
        </li>
        <li>
          <code>dog AND cat</code> searches for documents including both
          <em>dog</em> and <em>cat</em>.
        </li>
        <li>
          <code>dog NOT cat</code> searches for documents including
          <em>dog</em> but not <em>cat</em>.
        </li>
        <li>
          <code>(dog OR cat) AND mouse</code> is an example of a complex query.
        </li>
        <li>
          <code>ni?o</code> matches <em>ni&ntilde;o</em> as well as
          <em>nino</em>.
        </li>
        <li>
          <code>nina~</code> matches words similar to <em>nina</em>, such as
          <em>ni&ntilde;a</em> or <em>mina</em>.
        </li>
        <li>
          <code>"computer virus"~5</code> searches for <em>computer</em> and
          <em>virus</em> sepparated by, at most, 5 other words.
        </li>
        <li>
          <code>extension:.pdf AND path:*dog*</code> search for files with
          extension <em>.pdf</em> and the word <em>dog</em> in its path (either
          folder or filename).
        </li>
        <li>
          <code>last_modified:[2016-01-01 TO 2017-12-31]</code> files modified
          between January, 1st 2016 and December, 31st 2017.
        </li>
        <li>
          <code>tags:important</code> searches for documents labeled as
          important. Labels could be arbitrary, but these labels are already
          color-classified:
          <v-chip small label color="red" text-color="white">important</v-chip>
          <v-chip small label color="red" text-color="white">relevant</v-chip>
          <v-chip small label color="orange" text-color="white">warning</v-chip>
          <v-chip small label color="orange" text-color="white">check</v-chip>
          <v-chip small label color="green" text-color="white">seen</v-chip>
          <v-chip small label color="green" text-color="white"
            >irrelevant</v-chip
          >
        </li>
      </ul> </template
    ><template v-else-if="queryType === 'simple_query'">
      <em>Queries</em> use
      <a
        href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html"
        >Simple query syntax</a
      >. All fields are searched.
      <ul>
        <li>
          <code>*</code> returns all documents. Useful to know the size of the
          index.
        </li>
        <li>
          <code>dog cat</code> is equivalent to <code>dog | cat</code>. This
          query searches for documents including either <em>dog</em> or
          <em>cat</em> or both terms.
        </li>
        <li>
          <code>dog | cat^4</code> searches for documents including any of these
          terms, but gives preference to <em>cat</em> when the relevance is
          calculated.
        </li>
        <li>
          <code>dog + cat</code> searches for documents including both
          <em>dog</em> and <em>cat</em>.
        </li>
        <li>
          <code>dog + -cat</code> searches for documents including
          <em>dog</em> but not <em>cat</em>.
        </li>
        <li>
          <code>(dog | cat) + mouse</code> is an example of a complex query.
        </li>
        <li>
          <code>nina~</code> matches words similar to <em>nina</em>, such as
          <em>ni&ntilde;a</em> or <em>mina</em>.
        </li>
        <li>
          <code>"computer virus"~5</code> searches for <em>computer</em> and
          <em>virus</em> sepparated by, at most, 5 other words.
        </li>
      </ul> </template
    ><template v-else-if="queryType === 'match'">
      <em>Queries</em> are matched exactly in the <em>content</em> field. No
      special syntax available. Check
      <a
        href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html"
        >the match query.</a
      >
      in ElasticSearch. </template
    ><template v-else>
      This query type has not a help message.
    </template>
  </div>
</template>

<script>
/** A Vue component as a DIV with help messages for the different query types.
 * @module search/HelpMessage
 * @vue-prop {String} queryType - The name of the currently selected query. Currently, query_string, simple_query or match.
 */
export default {
  props: {
    queryType: {
      type: String,
      mandatory: true,
      default() {
        return "";
      }
    }
  }
};
</script>
