const { where } = require("sequelize");
const {
  Moim,
  User,
  MoimDetail,
  MoimSet,
  DibsMoim,
} = require("../models/index");

exports.index = (req, res) => {
  res.render("index");
};

exports.reunion_GET = (req, res) => {
  res.render("moim");
};

exports.Moim_destory = async (req, res) => {
  const { user_id, moim_id } = req.body;
  try {
    await Moim.destroy({
      where: { user_id, moim_id },
    });
    res.json({ result: true });
  } catch (error) {
    res.json({ result: true, Message: "모임 정보 삭제에 실패하였습니다!!!" });
  }
};

exports.Moimset_patch = async (req, res) => {
  //각 유저 별 모임 점수 수정
  if (req.session.userInfo) {
    try {
      const { user_review, moim_id, user_id, updatereview } = req.body;
      await MoimSet.update(
        { user_review: updatereview },
        { where: { user_id, moim_id } }
      );
      res.send({
        result: true,
        Message: `해당 user의 점수를 ${updatereview}로 수정합니다`,
      });
    } catch (error) {
      res.send({
        result: false,
        Message: "에러 발생!! 유저의 별점을 설정할 수 없습니다.",
      });
    }
  } else {
    res.redirect("/login");
  }
};
exports.MoimSet_detory = async (req, res) => {
  if (req.session.userInfo) {
    try {
      const { user_review, moim_id, user_id } = req.body;
      await MoimSet.destroy({ where: { moim_id, user_id } });
      res.json({ result: true, Message: "모임 가입을 취소하였습니다." });
    } catch (error) {
      res.send({
        result: false,
        Message: "에러 발생!! 모임 가입을 해제할 수 없습니다.",
      });
    }
  } else {
    res.redirect("/login");
  }
};

exports.MoimSet_POST = async (req, res) => {
  if (req.session.userInfo) {
    try {
      const { user_review, moim_id, user_id } = req.body;
      MoimSet.create({ moim_id, user_id });
      res.send({
        result: true,
        Message: "모임에 가입해주신 것을 환영합니다.",
      });
    } catch (error) {
      res.send({
        result: false,
        Message: "에러 발생!! 모임에 가입할 수 없습니다.",
      });
    }
  } else {
    req.redirect("/login");
  }
};

exports.moim_detail_UPDATE = async (req, res) => {
  try {
    if (req.session.userInfo) {
      const { moim_id, content, min_people } = req.body;
      await MoimDetail.update({ content, min_people }, { where: { moim_id } });
      res.send({
        result: true,
        Message: "moim 정보 업데이트에 성공하셨습니다.",
      });
    } else {
      res.send({ result: false, Message: "모임 정보 수정에 실패하였습니다." });
    }
  } catch (error) {}
};

exports.Moim_UPDATE = async (req, res) => {
  if (req.session.userInfo) {
    const {
      title,
      on_line,
      max_people,
      expiration_date,
      even_date,
      location,
      represent_img,
      user_id,
      moim_id,
    } = req.body;
    await Moim.update(
      {
        title,
        on_line,
        max_people,
        expiration_date,
        even_date,
        location,
        represent_img,
        user_id,
      },
      { where: { moim_id } }
    );
    res.send({
      result: true,
      Message: "moim 정보 업데이트 1단계에 성공하셨습니다.",
    });
  } else {
    res.redirect("/login");
  }
};

exports.MoimDetail_POST = async (req, res) => {
  if (req.session.userInfo) {
    try {
      const { moim_id, content, min_people } = req.body;
      await MoimDetail.create({ moim_id, content, min_people });
      res.json({ result: true });
    } catch {
      console.error(error);
      await Moim.destroy({ where: { moim_id } });
      //Moim_detaill 테이블에 정보 저장이 실패하였을 때, Moim table의 이전 저장 정보를 삭제한다.
      res.send({ result: false, Message: "모임 개설에 실패하였습니다." });
    }
  } else {
    res.redirect("/login");
  }
};

exports.reunion_POST = async (req, res) => {
  if (req.session.userInfo) {
    try {
      const {
        title,
        on_line,
        max_people,
        expiration_date,
        even_date,
        location,
        represent_img,
        user_id,
      } = req.body;
      const { data } = await Moim.create({
        title,
        on_line,
        max_people,
        expiration_date,
        even_date,
        location,
        represent_img,
        user_id,
      });
      res.json({ result: true, userInfo: data });
    } catch (error) {
      console.error(error);
      res.send({ result: false, Message: "모임 개설에 실패하였습니다." });
    }
  } else {
    res.redirect("/login");
  }
};

//모임 추가, 모임 detail 추가, 모임 수정, 모임 detail 수정, 모임 삭제(모임 detail은 동시 삭제)
//모임 set 테이블 추가, 수정, 삭제 TEST만 남음
