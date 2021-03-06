//文章详情
const blog_detail = new Vue({
    el: '#blog_detail',
    data: {
        title: '',
        content: '',
        date: '',
        tags: '',
        views: ''
    },
    computed: {

    },
    created() {
        const serachUrlParams = location.search.indexOf('?') > -1 ? location.search.split('?')[1].split('&') : '';
        if (serachUrlParams == '') {
            return;
        }
        let blog_id = -1;
        for (let i = 0; i < serachUrlParams.length; i++) {
            if (serachUrlParams[i].split('=')[0] == 'blog_id') {
                try {
                    blog_id = parseInt(serachUrlParams[i].split('=')[1]);
                } catch (error) {
                    console.log(error)
                }
            }
        }

        axios.get('/queryBlogById', {
            params: {
                id: blog_id
            }
        }).then(resp => {
            console.log(resp)
            resp.data.data.forEach((item, index) => {
                let { title, content, ctime, views, tags, id } = item;
                this.title = title;
                this.content = content;
                this.date = (new Date(ctime * 1000)).toLocaleString();
                this.views = views;
                this.tags = tags;
            })
            // this.articleList = list;
            // this.page = page;
        }).catch(resp => {
            console.log(resp)
        })
    }
})

//发评论区
const send_comments = new Vue({
    el: '#send_comments',
    data: {
        ramdonCode: '',
        text: '',
        confirm: ''
    },
    methods: {
        getRamdonCode() {
            axios.get('/queryRamdonCode').then(resp => {
                this.ramdonCode = resp.data.data.data;
                this.text = resp.data.data.text;
            }).catch(resp => {
            })
        }
    },
    computed: {
        sendComments() {
            return function () {
                console.log(1)
                //获取文章的id，以便知道是在哪篇文章下的评论
                const serachUrlParams = location.search.indexOf('?') > -1 ? location.search.split('?')[1].split('&') : '';
                if (serachUrlParams == '') {
                    return;
                }
                let blog_id = -10;
                for (let i = 0; i < serachUrlParams.length; i++) {
                    if (serachUrlParams[i].split('=')[0] == 'blog_id') {
                        try {
                            blog_id = parseInt(serachUrlParams[i].split('=')[1]);
                        } catch (error) {
                            console.log(error)
                        }
                    }
                }
                const replay = document.getElementById('replay')
                const replay_name = document.getElementById('replay_name')
                const userName = document.getElementById('user-name')
                const email = document.getElementById('e-mail')
                const resContent = document.getElementById('res-content')
                const mask = document.getElementById('mask')
                if (userName.value == '') {
                    alert('请输入用户名~~')
                    return
                }
                if (email.value == '') {
                    alert('请输入邮箱~~')
                    return
                }
                if (resContent.value == '') {
                    alert('请输入评论内容~~')
                    return
                }
                if (mask.value == '') {
                    this.confirm = '验证码不能为空！';
                    return
                }
                if (mask.value != this.getText) {
                    this.confirm = '验证码错误！';
                    return
                }
                axios.get('/addComment', {
                    params: {
                        blog_id,
                        parent: replay.value,
                        parent_name: replay_name.value,
                        user_name: userName.value,
                        e_mail: email.value,
                        content: resContent.value
                    }
                }).then(resp => {
                    console.log(resp)
                    this.confirm = ''
                    userName.value = ''
                    email.value = ''
                    resContent.value = ''
                    mask.value = ''
                    alert(resp.data.msg)
                }).catch(resp => {
                    console.log(resp)
                })
            }
        },
        getCode() {
            return this.ramdonCode;
        },
        getText() {
            return this.text;
        },
        getConfirm() {
            return this.confirm;
        }
    },
    created() {
        this.getRamdonCode();
    },
})

//博客的评论展示
const blog_comments = new Vue({
    el: '#blog_comments',
    data: {
        total: 100,
        comments: [],
    },
    methods: {

    },
    computed: {
        //回复功能
        replay() {
            return function (comments_id, user_name) {
                document.getElementById('replay').value = comments_id;
                document.getElementById('replay_name').value = user_name;
                location.href = "#send_comments";
            }
        },
        getComments() {
            return this.comments
        },
        getTotal() {
            return this.total
        }
    },
    created() {
        const serachUrlParams = location.search.indexOf('?') > -1 ? location.search.split('?')[1].split('&') : '';
        if (serachUrlParams == '') {
            return;
        }
        let blog_id = -1;
        for (let i = 0; i < serachUrlParams.length; i++) {
            if (serachUrlParams[i].split('=')[0] == 'blog_id') {
                try {
                    blog_id = parseInt(serachUrlParams[i].split('=')[1]);
                } catch (error) {
                    console.log(error)
                }
            }
        }
        //获取文章详情
        axios.get(`/queryCommentsByBlogId?blog_id=${blog_id}`).then(resp => {
            console.log(resp.data.data)
            this.comments = resp.data.data
            for (let i = 0; i < this.comments.length; i++) {
                if (this.comments[i].parent > -1) {
                    this.comments[i].user_name = this.comments[i].user_name + '回复 @' + this.comments[i].parent_name
                }
            }
            this.total = resp.data.data.length;
        }).catch(resp => {
            console.log(resp)
        })
        //增加浏览次数
        axios.get(`/addViews?blog_id=${blog_id}`).then(resp => {
            console.log(resp)
        }).catch(resp => {
            console.log(resp)
        })
    }
})
