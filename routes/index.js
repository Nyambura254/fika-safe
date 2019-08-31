const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const { User, Sacco } = require('../models/user');
// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('login'));

//generate random Sacco code
const d = new Date;
function saccoCode(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result + d.getFullYear();
}

//date created
function creatd(d) {
  return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
}
router.get('/logs', ensureAuthenticated, (req, res) =>
  res.render('logs', {
    user: req.user
  }));
// Register Page
router.get('/register', ensureAuthenticated, (req, res) => res.render('register', {
  user: req.user,
  saccoCode: saccoCode(8),
  creatd: creatd(new Date)
}));
//Admin profile page
router.get('/myprofile', ensureAuthenticated, (req, res) =>
  res.render('adminprofile', {
    user: req.user
  })
)
//single Sacco profile page
router.get('/profile/:saccoId', ensureAuthenticated, (req, res) => {
  Sacco.findById(req.params.saccoId)
    .then(sacco => {
      if (!sacco) {
        return res.status(404).send({
          message: "Sacco not found with id " + req.params.saccoId
        });
      }
      res.status(200);
      res.render("saccoprofile",{
        sacco: sacco,
        user: req.user
      });
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "Sacco not found with id " + req.params.saccoId
        });
      }
      return res.status(500).send({
        message: "Error retrieving Sacco with id " + req.params.saccoId
      });
    });

});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  Sacco.find()
    .exec()
    .then(sacco => {
      res.render('dashboard', {
        user: req.user,
        sacco: sacco
      })
    });

});

module.exports = router;
