import express from 'express';
import connectDatabase from './config/db';
import { check, validationResult } from 'express-validator';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import User from './models/User';
import config from 'config';
import jwt from 'jsonwebtoken';
import auth from './middleware/auth';
import Entry from './models/Entry';

// Initialize express application
const app = express();

// Connect Database
connectDatabase();

// Configure Middleware
app.use(express.json({ extended: false}));
app.use(
  cors({
    origin: 'http://localhost:3000'
  })
);

// API endpoints
/**
 * @route GET /
 * @desc Test endpoint
 */
app.get('/', (req, res) => res.send('http get sent to root api endpoint'));

/**
 * @route POST api/users
 * @desc Register user
 */
app.post('/api/users',
  [
    check('name', 'Please enter your name').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const { name, email, password } = req.body;
    try {
      // Check if user exists
      let user = await User.findOne({ email: email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }]});
      }

      // Create a new user
      user = new User({
        name: name,
        email: email,
        password: password
      });

      // Encrypt the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save to db and return
      await user.save();
      
      // Generate and return a JWT token
      returnToken(user, res);
    } catch (error) {
      res.status(500).send('Server error');
    }
  }
});


// Connection Listener
const port = 5000;
app.listen(port, () => console.log(`Express server running on port ${port}`));

/**
 * @route GET api/auth
 * @desc Authenticate user
 */
app.get('/api/auth', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send('Unknown servor error');
  }
});

/**
 * @route POST api/login
 * @desc Login user
 */
app.post(
  '/api/login',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'A password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } else {
      const { email, password } = req.body;
      try {
        // Check if user exists
        let user = await User.findOne({ email: email });
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid email or password'}]});
        }

        // Check password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid email or password'}]});
        }

        // Generate and return a JWT token
        returnToken(user, res);
      } catch (error) {
        res.status(500).send('Server error');
      }
    }
  }
);

const returnToken = (user, res) => {
  const payload = {
    user: {
      id: user.id
    }
  };

  jwt.sign(
    payload,
    config.get('jwtSecret'),
    { expiresIn: '10hr' },
    (err, token) => {
      if (err) throw err;
      res.json({ token: token });
    }
  );
};

// Entry Endpoints

/**
 * @route POST api/entries
 * @desc Create entry
 */

 app.post(
   '/api/entries',
   [
     auth,
     [
      check('description', 'Please enter a valid food description.').not().isEmpty(),
      check('servingSize', 'Please enter a number for the serving size.').isNumeric(),
      check('unit', 'Please enter a valid unit for the serving size such as cups or grams').not().isEmpty(),
      check('servingsPerContainer', 'Please enter the number of servings per container.').isNumeric()
     ]
   ],
   async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
     } else {
        const { description, servingSize, unit, servingsPerContainer } = req.body;
       try {
         const user = await User.findById(req.user.id);

         // Create a new Entry
         const entry = new Entry({
           user: user.id,
           description: description,
           servingSize: servingSize,
           unit: unit,
           servingsPerContainer: servingsPerContainer
         });

         await entry.save();

         res.json(entry);
       } catch (error) {
         console.error(error);
         res.status(500).send('Server error');
       }
     }
   }
 );
 
/**
 * @route GET api/entries
 * @desc Get entries
 */

 app.get('/api/entries', auth, async (req, res) => {
   try {
     const entries = await Entry.find().sort({ date: -1});

     res.json(entries);
   } catch (error) {
     console.error(error);
     res.status(500).send('Server error');
   }
 });

 /**
  * @route GET api/entries/:id
  * @desc Get entry
  */

  app.get('/api/entries/:id', auth, async (req, res) => {
    try {
      const entry = await Entry.findById(req.params.id);

      if (!entry) {
        return res.status(404).json({ msg: 'Entry not found' });
      }

      res.json(entry);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });

  /**
   * @route DELETE api/entries/:id
   * @desc Delete an entry
   */
  
   app.delete('/api/entries/:id', auth, async (req, res) => {
      try {
        const entry = await Entry.findById(req.params.id);

        if (!entry) {
          return res.status(404).json({ msg: 'Entry not found'});
        }
        
        if(entry.user.toString() !== req.user.id) {
          return res.status(401).json({ msg: 'User not authorized' });
        }

        await entry.remove();

        res.json({ msg: 'Entry removed' });
      } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
      }
   });

   /**
    * @route PUT api/entries/:id
    * @desc Update an entry
    */

    app.put('/api/entries/:id', auth, async (req, res) => {
      try {
        const { description, servingSize, unit, servingsPerContainer } = req.body;
        const entry = await Entry.findById(req.params.id);

        if (!entry) {
          return res.status(404).json({ msg: 'Entry not found'});
        }

        if (entry.user.toString() !== req.user.id) {
          return res.status(401).json({ msg: 'User not authorized'})
        }

        entry.description = description || entry.description; 
        entry.servingSize = description || entry.servingSize;
        entry.unit = description || entry.unit;
        entry.servingsPerContainer = description || entry.servingsPerContainer;

        await entry.save();

        res.json(post);
      } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
      }
    });

 