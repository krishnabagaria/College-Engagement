const Post = require("../model/post");
const comment = require("../model/comment");

exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Post.find({type:"Blog"});
        blogs.sort(function(a, b){return b.date - a.date});
        res.render("blog.ejs", { blogs });
    } catch (err) {
        console.log(err);
    }
};

exports.getAllNotice = async (req, res) => {
    try {
        const notice = await Post.find({type:"Notice"});
        notice.sort(function(a, b){return b.date - a.date});
        res.render("notice.ejs", { notice });
    } catch (err) {
        console.log(err);
    }
};

exports.getAllInterview = async (req, res) => {
    try {
        const Interview = await Post.find({type:"Interview"});
        Interview.sort(function(a, b){return b.date - a.date});
        res.render("interview.ejs", { Interview });
    } catch (err) {
        console.log(err);
    }
};

exports.getAllContent = async (req, res) => {
    try {
        let id = req.query.id;
        const cont= await Post.find({_id:id});
        let val=cont[0].count;
        var myquery = { _id:id };
        var newvalues = { $set: {count:val+1} };
        Post.updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
        });
        let comm=[];
        for(let i in cont[0].comments){
            let obj=await comment.find({_id:cont[0].comments[i]})
            comm.push(obj);
        }
        comm.sort(function(a, b){return b[0].date - a[0].date});
        res.render("content.ejs", {cont,comm});
    } catch (err) {
        console.log(err);
    }
};

exports.getAllComments= async(req,res)=>{
    try{
        let obj={text:req.body.comment_text}
        comment.create(obj, function(err,newComment){
            if(err) console.log(err);
            else 
            {
                Post.findById( req.query.id , async function (err,foundPost){
                    if(err) console.log(err);
                    else{
                        newComment.text=obj.text;
                        newComment.author.id=req.session.user._id;
                        newComment.author.username=req.session.user.username;
                        newComment.date=new Date();
                        newComment.save();

                        // console.log(newComment);
                        foundPost.comments.push(newComment);
                        foundPost.save();
                        let id = req.query.id;
                        const cont= await Post.find({_id:id});
                        let comm=[];
                        for(let i in cont[0].comments){
                            let obj=await comment.find({_id:cont[0].comments[i]})
                            comm.push(obj);
                        }
                        comm.sort(function(a, b){return b[0].date - a[0].date});
                        res.render("content.ejs", {cont,comm});
                    }
                });
            }
        });
    }catch(err){
        console.log(err);
    }
}

exports.getAllexplore = async (req, res) => {
    try {
        const posts = await Post.find({type:{ $nin: ["Notice"] }});
        let explore=[];
        let cur= new Date();
        let ptime=cur.getTime();
        let total=0;
        for(let i in posts){
            total+=posts[i].count;
        }
        for(let i in posts){
            let cnt=posts[i].count;
            let temp=posts[i].newdate;
            let curtime=temp;
            curtime=ptime-curtime;
            curtime/=86400000;
            if(curtime<3)
                curtime=30-curtime+15;
            else if(curtime<7)
                curtime=30-curtime+10;
            else if(curtime<15)
                curtime=30-curtime+5;
            else if(curtime>30)
                curtime=4;
            let rank=cnt;
            rank=((rank/total)*40)+10+curtime;
            explore.push([rank,posts[i]._id])
        }
        explore.sort(function(a, b){return b[0] - a[0]});
        //console.log(explore);
        let msize=Math.min(explore.length,10);
        let data=[];
        for(let i=0;i<msize;i++){
            let post=posts.find(o => o._id === explore[i][1]);
            data.push(post);
        }
        res.render("explore.ejs", {data});
    } catch (err) {
        console.log(err);
    }
};

