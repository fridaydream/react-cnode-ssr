export const topicPrimaryStyle = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    color: '#555'
  },
  tab: {
    backgroundColor: theme.palette.accent[500],
    textAlgin: 'center',
    display: 'inline-block',
    color: '#fff',
    borderRadius: 3,
    marginRight: 10,
    padding: '0 6px',
    fontSize: '12px'
  },
  top: {
    backgroundColor: theme.palette.primary[500]
  }
})

export const topicSecondaryStyle = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 3,
  },
  count: {
    textAlgin: 'center',
    marginRight: 20
  },
  userName: {
    marginRight: 20,
    color: '#9e9e9e'
  },
  accentColor: {
    color: theme.palette.accent[300]
  }
})
