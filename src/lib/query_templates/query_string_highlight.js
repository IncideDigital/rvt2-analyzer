export default function(
  query,
  size = 50,
  offset = 0,
  sortBy = "_score",
  descending = false
) {
  var queryES = {
    from: offset,
    size: size,
    query: {
      query_string: {
        query: query,
        default_field: "*",
        analyze_wildcard: true
      }
    },
    //'_source': [ 'file', 'tags', 'path'  ],
    highlight: {
      order: "score",
      //'fields': {'*': {}},
      fields: {
        content: {},
        path: {},
        filename: {},
        tags: {}
      },
      require_field_match: false,
      fragment_size: 50,
      number_of_fragments: 3
    }
    /*'aggs' : {
            'modified_over_time' : {
                'date_histogram' : {
                    'field' : 'last_modified',
                    'interval' : 'day'
                }
            }
        }*/
  };
  // the sorting part must be a bit more verbose
  var sorting = {};
  sorting[sortBy] = { order: descending ? "desc" : "asc" };
  queryES["sort"] = sorting;
  return queryES;
}
