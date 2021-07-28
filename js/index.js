(function (window) {
    var ua = navigator.userAgent.toLowerCase() || navigator.vendor || window.opera;
    var data = {
        searchTxt: "",
        viewHeight: document.body.clientHeight,
        AllowLogIn: false,
        groupName:"",
        totalList:0,
        groupId:"",
        userInfo:"",
        params: params,
        ref: db.collection('botMember'),
        workref:"",
        ListData:[],
        HeadData:[],
        allWork:[]
    }
    var vm = new Vue({
        el: "#main",
        data: data,
        computed: {
            PageHeight: function () {
                return this.viewHeight - 147 + "px"
            },
            groupInfo:function(){
                return db.collection('loginGroup').doc(this.groupId)
            },
            args: function () {
                var ret = {};
                var str = this.params;
                if (!str) {
                    return ret;
                }
                var seg = str.replace(/^\?/, "").split('&');

                for (var i = seg.length - 1; i >= 0; i--) {
                    if (!seg[i]) {
                        continue;
                    }
                    var s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }

                return ret;
            }
        },
        mounted: function () {
            this.viewHeight = document.body.clientHeight;
            window.addEventListener('resize', this.heightChange);
        },
        created: function () {
            if(this.args.groupid){
                this.groupId = this.args.groupid;
            }else{
                this.AllowLogIn = false;
                return
            }
            var groupInfo = this.groupInfo;
            groupInfo.get().then(doc => {
                this.groupName = doc.data()['groupName']
            })
            var list = this.ref;
            if (list) {
                this.AllowLogIn = true;
                var data = list;
                var self = this;
                var ListData = this.ListData;
                var headData = this.HeadData;
                
                data.get().then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        if (doc.id != 'title') {
                            if (doc.data()['groupid'] == self.groupId) {
                                ListData.push(doc.data());
                            }
        
                        } else {
                            headData.push(doc.data());
                        }
                    });
                    this.totalList = ListData.length;
                    ListData.sort(function (a, b) {
                        var value1 = a['gameWork'];
                        var value2 = b['gameWork'];
                        if (value1 == value2) {
                            return a['userName'] > b['userName'] ? 1 : -1
                        } else {
                            return value1 > value2 ? 1 : -1
                        }
                    })
                });
            } else {
            }            

        },

        methods: {
            heightChange: function (event) {
                var screenHeight = document.body.clientHeight;
                this.viewHeight = screenHeight;
            }

        }
    })
})(window);