var React = require('react');
var request = require('superagent');
var converter = new Showdown.converter();

var Comment = React.createClass({

    render: function() {
        var rawMarkup = converter.makeHtml(this.props.children.toString());
        return(
            <div className="comment">
              <h2 className="commentAuthor">
                {this.props.author}
              </h2>
              <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
            </div>
        );
    }

});

var CommentList = React.createClass({

    render: function() {
        var commentNodes = this.props.data.map(function(comment) {
            return (
                <Comment author={comment.author}>
                  {comment.text}
                </Comment>
            );
        });
        return (
            <div className="commentList">
              {commentNodes}
            </div>
        );
    }

});

var CommentForm = React.createClass({

    handleSubmit: function(e) {
        e.preventDefault();

        var author = this.refs.author.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();
        if (!text || !author) {
            return;
        }

        this.props.onCommentSubmit({ author: author, text: text });

        this.refs.author.getDOMNode().value = '';
        this.refs.text.getDOMNode().value = '';
    },

    render: function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
              <input type="text" placeholder="Your name" ref="author" />
              <input type="text" placeholder="Say something..." ref="text" />
              <input type="submit" value="Post" />
            </form>
        );
    }

});

var CommentBox = React.createClass({

    loadCommentsFromServer: function() {
        request.get(this.props.url)
               .end(function(res) {
                   console.log(res);
                   if (res.ok) {
                       this.setState({data: res.body});
                   } else {
                       console.warn(res.text);
                   }
               }.bind(this))
    },

    handleCommentSubmit: function(comment) {
        var comments = this.state.data;
        var newComments = comments.concat([comment]);
        this.setState({data: newComments});
        request.post(this.props.url)
               .set('Content-Type', 'application/json')
               .send(comment)
               .end(function(res) {
                   if (!res.ok) {
                       console.log(res.text);
                   }
               }.bind(this));
    },

    getInitialState: function() {
        return { data: [] }
    },

    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },

    render: function() {
        return (
            <div className="commentBox">
              <h1>Comments</h1>
              <CommentList data={this.state.data} />
              <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
        );
    }

});

module.exports = CommentBox;
